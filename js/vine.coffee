root = this
History = root.History

# dummy update function
if not window.update?
	window.update = () -> null

$ ->
	$('.search-box').each (i, box) -> new SearchBox(box)
	$('.loader').append $('<div>'), $('<div>'), $('<div>'), $('<div>'), 
		$('<div>'), $('<div>'), $('<div>'), $('<div>')

	$('#player-controls, #player-controls *:not(#player-info)').attr('unselectable', 'on')

	vine.player = new VinePlayer

	# Read the URL and decide where we need to go
	[viewname, [], query] = relpath(vine.siteroot, location.pathname).partition '/'
	query = vine.decodePath(query)

	if viewname == 'search'
		vine.search(query)
	else if viewname == 'player'
		# TODO, if a query is sent, build player for that song
		view.change 'player'
		vine.reloadSong(query)
	else
		view.change 'home'
		vine.pushState()
	
	# Listen for history changes and change views accordingly
	History.Adapter.bind window, 'statechange', (e)->
		state = History.getState()
		document.title = 'Audio Vine'

		if state.data.id? and state.data.id != vine.currentState and state.data.view?
			console.log 'STATE', state.data.id, vine.currentState, state.data.id != vine.currentState, state
			vine.currentState = state.data.id
			
			if state.data.view == 'search' and state.data.query? and state.data.query != vine.currentQuery
				console.log 'restoring search'
				vine.search(state.data.query, true)

			else if state.data.view == 'player' and state.data.rootnode? and state.data.rootnode.song.id != vine.rootnode.song.id
				console.log 'restoring player', state.data.rootnode
				vine.selectSong(SongData.clone(state.data.rootnode.song), true)

			else if state.data.view == 'player' and (not state.data.rootnode?.song instanceof SongData) and state.data.song?
				console.log 'restoring player from song encoding', state.data.song
				vine.reloadSong(state.data.song, true)

			else if state.data.view != view.currentView
				view.change(state.data.view)


root.gs = new GrooveShark '67b088cec7b78a5b29a42a7124928c87'
root.cache = new LastFMCache
root.lastfm = new LastFM
	apiKey: '6e9f1f13f07ba5bcbfb0a8951811c80e'
	apiSecret: '4db7199ede1a06b27e6fd96705ddba49'
	cache: cache




# The main application object
root.vine =
	siteroot: '/cs465'
	currentState: 0

	rootnode: null

	maxSearchResults: 20
	currentQuery: null

	# coordinates between the graph, view controls, and Grooveshark
	player: null

	# updates the URL history
	pushState: (state, path) ->
		vine.currentState += 1

		state = state ? {}
		path = path ? ''
		state.id = vine.currentState
		state.view = view.currentView

		console.log 'pushing state', vine.currentState
		History.pushState state, '', vine.siteroot + view.getPath(view.currentView) + vine.encodePath(escape(path))

	# runs a search for the given query
	search: (query, restoring) ->
		vine.currentQuery = query

		$('.search-query').text query
		vine.resetSearchResults()

		view.change 'search'
		if not restoring
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
	selectSong: (song, restoring) ->
		console.log 'selected song', song, song instanceof SongNode, song instanceof SongData
		view.change 'player'

		vine.rootnode = new SongNode(song)

		if not restoring
			console.log 'pushing state'
			vine.pushState { rootnode: vine.rootnode, song: vine.encodeSongURL(song) }, vine.encodeSongURL(song)
		vine.resetSearchResults()
		vine.currentQuery = null
		vine.player.init(vine.rootnode)

	reloadSong: (url, restoring) ->
		decoded = vine.decodeSongURL(url)
		if 'mbid' of decoded
			await SongData.fromMBID decoded.mbid, (defer err, song)
		else
			await SongData.create decoded.name, decoded.artist, (defer err, song)

		vine.selectSong(song, restoring)

	encodePath: (path) ->
		return encodeURIComponent(escape(path))

	decodePath: (path) ->
		return unescape(decodeURIComponent(path))

	encodeSongURL: (song) ->
		if not song?.name?
			return ''

		if song.mbid
			return song.mbid
		else
			return song.name.replace('/', '%2F') + '/' + song.artist.replace('/', '%2F')

	decodeSongURL: (url) ->
		if url.match /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
			return { mbid: url }
		else
			[name, [], artist] = url.partition '/'
			return {
				name: name.replace('%2F', '/')
				artist: artist.replace('%2F', '/')
			}

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
	currentSong = null

	# current time in seconds
	position = 0
	duration = 0
	positionTimer = -1
	lastIntervalTime = 0

	# songs to play
	queue = []
	# songs that have been played
	playedSongs = []
	autoQueuedSong = null

	constructor: ->
		@elems =
			favorite: $ '#btn-favorite'
			prev: $ '#btn-prev'
			playpause: $ '#btn-playpause'
			next: $ '#btn-next'
			art: $ '#album-art'
			albumlink: $ '#album-link'
			song: $ '#song-name'
			artist: $ '#artist-name'
			currentTime: $ '#current-time'
			totalTime: $ '#total-time'
			seek: $ '#ctrl-seek'
			volume: $ '#ctrl-volume'

		@goBackThreshold = 3

		@elems.playpause.click (e) =>
			if @playing
				@pause()
			else
				@play()

		@elems.prev.click (e) =>
			@playPrevious()

		@elems.next.click (e) =>
			@playNext()

		@elems.seek.slider
			range: 'min'
			min: 0
			max: 0
			value: 0
			slide: (e, ui) =>
				# change the time text while sliding
				@elems.currentTime.text formatTime(ui.value)
			start: (e, ui) =>
				# stop moving the slider when the user grabs it
				@_stopUpdate()
			stop: (e, ui) =>
				# finalize the seek and start moving the slider again when it is released
				@seek(ui.value)
				if @playing
					@_startUpdate()

		@elems.volume.slider
			orientation: 'vertical'
			range: 'min'
			min: 0
			max: 1
			step: 0.05
			value: 1
			slide: (e, ui) =>
				@volume = ui.value

				

	# resets the player starting with a given song
	init: (firstSong) =>
		queue = []
		playedSongs = []
		currentSong = firstSong
		update(@currentSong)
		@updateSongInfo()
		@updatePosition(0)
		@play()
		vine?.grooveshark.enqueue(currentSong)
		await @currentSong.expand (defer err)
		if err
			# TODO: show an error message
		else
			update(@currentSong)
			@updateAutomaticSong()

	# timer to keep incrementing position while not receiving status messages
	_interval: =>
		now = Date.now()
		delta = (now - lastIntervalTime) / 1000
		lastIntervalTime = now
		@updatePosition(@position + delta)

	_stopUpdate: =>
		window.clearInterval(positionTimer)

	_startUpdate: =>
		lastIntervalTime = Date.now()
		positionTimer = window.setInterval(@_interval, 500)

	# sets the position of the seeker control
	updatePosition: (time) =>
		position = Math.min(@duration, Math.max(0, time))
		@elems.seek.slider { value: position }
		@elems.currentTime.text formatTime(position)

	@property 'volume',
		get: -> volume
		set: (val) -> 
			volume = Math.min(1, Math.max(0, val))
			@elems.volume.slider { value: volume }
			vine?.grooveshark.setVolume(volume)

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

	@property 'nextSong',
		get: ->
			if queue.length > 0
				return queue[0]
			else
				return autoQueuedSong

	@property 'position',
		get: -> position

	@property 'duration',
		get: -> duration
		set: (val) ->
			duration = val
			@elems.seek.slider { max: val }
			@elems.totalTime.text formatTime(val)

	@property 'queue',
		get: -> queue

	@property 'playedSongs',
		get: -> playedSongs

	_expand: (node, callback) =>
		await node.expand (defer err)
		if err
			# TODO: show an error
			console.log('ERROR', err)
			callback?(err, null)
		else
			update(node)
			callback(null, node)

	play: =>
		if not @playing
			@_stopUpdate()
			@_startUpdate()
			@playing = true
			vine?.grooveshark.play()

	pause: =>
		if @playing
			@_stopUpdate()
			@playing = false
			vine?.grooveshark.pause()

	seek: (time) =>
		@updatePosition(time)
		vine?.grooveshark.seek(time)

	# updates the player controls
	updateSongInfo: () =>

		song = currentSong?.song
		if song?.url?
			@elems.song.empty().append $('<a target=_blank>').attr('href', song.url)
				.text(song?.name ? 'No Title')
		else
			@elems.song.empty().text(song?.name ? 'No Title')

		if song?.artistUrl?
			@elems.artist.empty().append $('<a target=_blank>').attr('href', song.artistUrl)
				.text(song?.artist ? 'No Artist')
		else
			@elems.artist.empty().text(song?.artist ? 'No Artist')

		if song?.albumArt?
			@elems.art.attr 'src', song?.albumArt 
			@elems.art.addClass 'hasart'
		else
			@elems.art.attr 'src', '/cs465/img/no-album.svg'
			@elems.art.removeClass 'hasart'

		if song?.albumUrl?
			@elems.albumlink.attr 'href', song.albumUrl
		else
			@elems.albumlink.removeAttr 'href'

		# TODO: update song duration

	# begins playing the given song
	playNow: (songnode) =>
		queue.unshift(songnode)
		@playNext()

	# adds the given song to the end of the queue.
	# If the song is already queued, it will be moved to the end.
	enqueue: (songnode) =>
		queue.remove(songnode)
		queue.push(songnode)
		update(songnode)
		await @_expand(songnode, (defer err))
		if not err
			@updateAutomaticSong()

	# removes the given song from the queue
	dequeue: (songnode) =>
		queue.remove(songnode)
		update(songnode)

	enqueueAutomaticSong: (callback) =>
		if not autoQueuedSong?
			await @updateAutomaticSong (defer err)

		if autoQueuedSong?
			@enqueue(autoQueuedSong)
			callback(null, autoQueuedSong)
		else
			console.log('Error: failed to auto-queue a song')
			callback(new Error('Failed to auto-queue a song'), null)

	updateAutomaticSong: (callback) =>
		if queue.length > 0
			parent = queue[queue.length - 1]
		else
			parent = @currentSong

		await @_expand(parent, (defer err))

		choices = parent.children
		# dumb selection code. randomly pick a child and queue it
		i = Math.min(Math.floor(Math.random() * choices.length), choices.length - 1)
		autoQueuedSong = choices[i]
		update(autoQueuedSong)

	# gets whether a song is in the queue
	isQueued: (songnode) =>
		return queue.contains(songnode)

	# gets whether a song is the automatically selected next song
	isAutoQueued: (songnode) =>
		return autoQueuedSong == songnode

	# gets whether a song is currently playing
	isPlaying: (songnode) =>
		return currentSong == songnode

	# gets whether a song was previously played
	wasPlayed: (songnode) =>
		return playedSongs.contains(songnode)

	# moves to the next queued song
	playNext: =>
		lastPlayed = currentSong
		currentSong = queue.shift()
		if @currentSong?
			console.log('now playing', @currentSong)
			playedSongs.push(lastPlayed)
			update(lastPlayed)
			update(@currentSong)
			@updateSongInfo()
			@updatePosition(0)
			@play()
			vine?.grooveshark.enqueue(@currentSong)
			await @_expand(@currentSong, (defer err))
			@updateAutomaticSong()
		else
			currentSong = lastPlayed
			await @enqueueAutomaticSong (defer err)
			if err
				console.log('Error: no song to play next')
			else
				@playNext()

	# restarts the current song or plays the previously played song
	playPrevious: =>
		if playedSongs.length > 0 and position < @goBackThreshold
			# if there is a previous song and we are only a few seconds in, go back
			lastPlayed = currentSong
			queue.unshift(currentSong)
			currentSong = playedSongs.pop()
			vine?.grooveshark.enqueue(@currentSong)
			update(lastPlayed)
			update(@currentSong)
			@updateSongInfo()

			@updatePosition(0)
			if @playing
				@play()
		else
			# else restart the song
			@seek(0)
			if @playing
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

formatTime = (time) ->
	mins = Math.floor(time / 60).toString()
	secs = Math.floor(time % 60).toString()

	return '00'.substr(mins.length) + mins + ':' + '00'.substr(secs.length) + secs


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