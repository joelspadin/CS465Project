root = this
History = root.History


$ ->
	$('.search-box').each (i, box) -> new SearchBox(box)
	$('.loader').append $('<div>'), $('<div>'), $('<div>'), $('<div>'), 
		$('<div>'), $('<div>'), $('<div>'), $('<div>'), 

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

	pushState: (state, path) ->
		state = state ? {}
		path = path ? ''
		state.view = view.currentView
		History.pushState state, '', vine.siteroot + view.getPath(view.currentView) + path

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
			console.log 'Getting LastFM data for', result
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
				
	selectSong: (song) ->
		view.change 'player'
		vine.rootnode = new SongNode(song)
		vine.pushState { rootnode: vine.rootnode }
		vine.resetSearchResults()
		vine.currentQuery = null

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
