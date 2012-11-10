root = this
History = root.History


$ ->
	$('.search-box').each (i, box) -> new SearchBox(box)
	$('.loader').append $('<div>'), $('<div>'), $('<div>'), $('<div>'), 
		$('<div>'), $('<div>'), $('<div>'), $('<div>'), 

	vine.player = new VinePlayer

	# Read the URL and decide where we need to go
	[viewname, [], query] = relpath(vine.siteroot, location.pathname).partition '/'
	
	if viewname == 'search'
		vine.search(query)
	else if viewname == 'player'
		# TODO, if a query is sent, build player for that song
		view.change 'player'
		vine.pushState()
	else
		view.change 'home'
		vine.pushState()
	
	# Listen for history changes and change views accordingly
	History.Adapter.bind window, 'statechange', (e)->
		state = History.getState()

		if state != vine.currentstate
			console.log state, view.currentState
			vine.currentState = state
			if state.data.view != view.currentView
				view.change(state.data.view)

			if state.data.view == 'search' and state.data.query? and state.data.query != vine.currentQuery
				vine.search(state.data.query)


root.gs = new GrooveShark '67b088cec7b78a5b29a42a7124928c87'
root.cache = new LastFMCache
root.lastfm = new LastFM
	apiKey: '6e9f1f13f07ba5bcbfb0a8951811c80e'
	apiSecret: '4db7199ede1a06b27e6fd96705ddba49'
	cache: cache




# The main application object
root.vine =
	siteroot: '/cs465'
	currentState: null
	rootnode: null

	maxSearchResults: 20
	currentQuery: null

	# coordinates between the graph, view controls, and Grooveshark
	player: null

	# updates the URL history
	pushState: (state, path) ->
		state = state ? {}
		path = path ? ''
		state.view = view.currentView
		History.pushState state, '', vine.siteroot + view.getPath(view.currentView) + path

	# runs a search for the given query
	search: (query) ->
		vine.currentQuery = query

		$('.search-query').text query
		vine.resetSearchResults()

		view.change 'search'
		vine.pushState { query: query }, query

		vine.showResultsSpinner()
		results = []
		await gs.search query, vine.maxSearchResults, (defer err, candidates)

		await for result in candidates
			#console.log 'Getting LastFM data for', result
			data = SongData.fromGroovesharkData(result)
			data.getLastFMData (defer err)
			if not err
				results.push data

		vine.hideResultsSpinner()

		if err
			vine.showNoResults()
		else if results.length == 0
			vine.showNoResults()
		else
			vine.fadeInSearchResults()
			for song in results
				vine.addSearchResult song
				
	# picks a search result and starts playing it
	selectSong: (song) ->
		view.change 'player'
		vine.rootnode = new SongNode(song)
		vine.pushState { rootnode: vine.rootnode }
		vine.resetSearchResults()
		vine.currentQuery = null
		vine.player.init(vine.rootnode)

	# clears the search results view to its initial state
	resetSearchResults: ->
		vine.hideSearchResults()
		vine.hideResultsSpinner()
		vine.hideNoResults()
		vine.clearSearchResults()
		$('#view-search .search-box input[type=text]').val('')

	showSearchResults: ->
		$('#search-results').show()

	hideSearchResults: ->
		$('#search-results').hide()

	fadeInSearchResults: ->
		$('#search-results').fadeIn()

	fadeOutSearchResults: ->
		$('#search-results').fadeOut()

	clearSearchResults: ->
		$('#search-results tbody').empty()

	addSearchResult: (song) ->
		table = $('#search-results tbody')
		table.append $('<tr>').append(
			$('<td>').text(song.name),
			$('<td>').text(song.artist),
			$('<td>').text(song.album))
			.click (e) ->
				vine.selectSong(song)

	showResultsSpinner: ->
		$('#getting-results').show()

	hideResultsSpinner: ->
		$('#getting-results').hide()
		
	showNoResults: ->
		$('#no-results').show()
		$('#showing-results').hide()

	hideNoResults: ->
		$('#no-results').hide()
		$('#showing-results').show()



# Handles views and view changes
root.view =
	currentView: 'home'

	views:
		'home': '/'
		'search': '/search/'
		'player': '/player/'

	select: (name) ->
		return $('#view-' + name)

	change: (name) ->
		for v, path of view.views
			if v == name
				view.select(v).show()
			else
				view.select(v).hide()
		view.currentView = name

	getPath: (name) ->
		return view.views[name]




Function::property = (prop, desc) ->
	Object.defineProperty @prototype, prop, desc


class VinePlayer
	volume = 1
	playing = false
	currentSong: null

	# current time in seconds
	position = 0
	positionTimer = -1
	lastIntervalTime = 0

	# songs to play
	queue = []
	# songs that have been played
	playedSongs = []

	constructor: ->
		@elems =
			favorite: $ '#btn-favorite'
			prev: $ '#btn-prev'
			playpause: $ '#btn-playpause'
			next: $ '#btn-next'
			art: $ '#album-art'
			song: $ '#song-name'
			artist: $ '#artist-name'
			currentTime: $ '#current-time'
			seek: $ '#ctrl-seek'
			volume: $ '#ctrl-volume'

		@goBackThreshold = 3

	# resets the player starting with a given song
	init: (firstSong) ->
		queue = []
		playedSongs = []
		currentSong = firstSong
		@updatePosition(0)
		@play()

	# timer to keep incrementing position while not receiving status messages
	_interval: ->
		now = Date.now()
		delta = (lastIntervalTime - now) / 1000
		lastIntervalTime = now
		@updatePosition(@position + delta)

	# sets the position of the seeker control
	updatePosition: (time) ->
		position = time
		# TODO: update seek control

	@property 'volume',
		get: -> volume
		set: (val) -> 
			volume = val
			# TODO: update volume control

	@property 'playing',
		get: -> playing
		set: (val) ->
			playing = !!val
			if playing
				@elems.playpause.addClass('pause')
			else
				@elems.playpause.removeClass('pause')
				

	@property 'currentSong',
		get: -> currentSong

	@property 'position',
		get: -> position

	@property 'queue',
		get: -> queue

	@property 'playedSongs',
		get: -> playedSongs

	play: ->
		if not @playing
			lastIntervalTime = Date.now()
			window.clearInterval(positionTimer)
			positionTimer = window.setInterval(@_inverval, 300)
			# TODO: start playing
			@playing = true

	pause: ->
		if @playing
			window.clearInterval(positionTimer)
			# TODO: stop playing
			@playing = false

	seek: (time) ->
		updatePosition(time)
		# TODO: seek to position in song

	enqueue: (songnode) ->
		queue.remove(songnode)
		queue.push(songnode)
		# TODO: update graph

	dequeue: (songnode) ->
		queue.remove(songnode)
		# TODO: update graph

	enqueueAutomaticSong: () ->
		# TODO: find automatically selected song
		@enqueue(null)

	# gets whether a song is in the queue
	isQueued: (songnode) ->
		return queue.contains(songnode)

	# gets whether a song was previously played
	wasPlayed: (songnode) ->
		return playedSongs.contains(songnode)

	# moves to the next queued song
	playNext: ->
		lastPlayed = currentSong
		currentSong = queue.shift()
		if @currentSong?
			playedSongs.push(lastPlayed)
			@updatePosition(0)
			@play()
		else
			@enqueueAutomaticSong()
			@playNext()

	# restarts the current song or plays the previously played song
	playPrevious: ->
		if playedSongs.length > 0 and position < @goBackThreshold
			# if there is a previous song and we are only a few seconds in, go back
			queue.unshift(currentSong)
			currentSong = playedSongs.pop()
			# TODO: update graph

			@updatePosition(0)
			@play()
		else
			# else restart the song
			@seek(0)
			@play()



# Attaches search events to a search box element
class SearchBox
	constructor: (elem) ->
		@elem = $(elem)
		@input = @elem.find 'input[type=text]'
		@submit = @elem.find 'input[type=button]'

		@input.keypress (e) =>
			if e.which == 13
				@go()

		@submit.click => @go()

	@property 'query',
		get: -> @input.val().trim()
		set: (q) -> @input.val(q)

	go: ->
		if @query.trim() == ''
			return
		vine.search(@query)
		@query = ''
		

# Gets a relative path from 'base' to 'path'
relpath = (base, path) ->
	filter = (part) -> !!part.trim()
	path = path.split('/').filter(filter)
	base = base.split('/').filter(filter)

	end = Math.min(path.length, base.length)
	i = 0
	while i < end
		if path[i] == base[i]
			path.shift()
			base.shift()
		i++

	for remaining in base
		path.unshift '..'

	return path.join('/')


# Splits a string at the first occurance of 'sep' and returns [before, sep, after]
# If 'sep' is not found, returns [string, '', '']
String::partition = (sep) ->
	if (_index = this.indexOf(sep)) >= 0
		return [this.substr(0, _index), sep, this.substr(_index + sep.length)]
	else
		return [this.toString(), '', '']

Array::contains = (item) ->
	for x in this
		if x == item
			return true
	return false

Array::remove = (item) ->
	i = 0
	while i < this.length
		if this[i] == item
			this.splice(i, 1)
		else
			i += 1