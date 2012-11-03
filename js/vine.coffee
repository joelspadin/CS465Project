root = this
History = root.History


$ ->
	$('.search-box').each (i, box) -> new SearchBox(box)

	# Read the URL and decide where we need to go
	[viewname, [], query] = relpath(vine.siteroot, location.pathname).partition '/'
	
	if viewname == 'search'
		vine.search(query)
	else if viewname == 'player'
		console.log('Player should happen here')
		view.change 'player'
		vine.pushState()
	else
		view.change 'home'
		vine.pushState()
	
	# Listen for history changes and change views accordingly
	History.Adapter.bind window, 'statechange', ->
		state = History.getState()
		console.log 'statechange:', state
		if state.data.view != view.currentView
			view.change(state.data.view)


# The main application object
root.vine =
	siteroot: '/cs465'

	search: (query) ->
		$('#search-query').text query
		view.change 'search'
		vine.pushState { query: query }, query

	pushState: (state, path) ->
		state = state ? {}
		path = path ? ''
		state.view = view.currentView
		History.pushState state, '', vine.siteroot + view.getPath(view.currentView) + path


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
		@elem = $ elem
		@input = @elem.find 'input[type=text]'
		@submit = @elem.find 'intput[type=button]'

		@input.keypress (e) =>
			if e.which == 13
				@go()

		@submit.click => @go()

	@property 'query',
		get: -> @input.val()
		set: (q) -> @input.val(q)

	go: ->
		vine.search(@query)
		

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
