root = this

Function::property = (prop, desc) ->
	Object.defineProperty @prototype, prop, desc

awaitable = (func) ->
	return (args..., callback) ->
		func.apply this, args.concat 
			success: (result) -> callback(null, result)
			error: (err) -> 
				if arguments.length > 1
					err = Array::slice.apply(arguments)
				callback(err, null)

class root.SongData
	@property 'id',
		get: -> this.lastfm.id

	@property 'mbid',
		get: -> this.lastfm.mbid

	@property 'name',
		get: -> this.lastfm.name ? this.gs.name

	@property 'artist',
		get: -> this.lastfm.artist ? this.gs.artist

	@property 'album',
		get: -> this.lastfm.album ? this.gs.album

	@property 'albumArt',
		get: -> this.lastfm.albumArt?['small'] ? null

	@property 'largeAlbumArt',
		get: -> this.lastfm.albumArt?['large'] ? null

	constructor: () ->
		this.loaded = false

		this.lastfm = 
			id: null
			mbid: null
			name: null
			artist: null
			album: null
			url: null

		this.gs = 
			id: null
			name: null
			artist: null
			album: null
			url: null

	getLastFMData: (callback) =>
		await awaitable(lastfm.track.getInfo)
			track: this.name,
			artist: this.artist ? null
			autocorrect: 1
		, (defer err, data)

		if err
			callback err, this
			return
		
		#console.log data

		this.lastfm.id = data.track.id
		this.lastfm.mbid = data.track.mbid ? null
		this.lastfm.name = data.track.name
		this.lastfm.artist = data.track.artist?.name ? null
		this.lastfm.album = data.track.album?.title ? null
		this.lastfm.albumArt = SongData.parseLastFMImage(data.track.album?.image ? data.image)
		this.lastfm.url = data.track.url

		callback null, this

	getGroovesharkData: (callback) =>
		await root.gs.search "#{this.name} #{this.artist}", (defer err, data)

		if err
			callback err, this
			return

		if not data?
			callback new Error("Cannot find '#{this.name} #{this.artist}' on Grooveshark"), this
			return

		this.gs.id = data.SongID
		this.gs.name = data.SongName
		this.gs.artist = data.ArtistName
		this.gs.album = data.AlbumName
		this.gs.url = data.Url

		callback null, this

	@clone: (song) ->
		songdata = new SongData
		songdata.gs = song.gs
		songdata.lastfm = song.lastfm
		songdata.loaded = song.loaded
		return songdata

	@create: (name, artist, callback) ->
		songdata = new SongData
		
		songdata.lastfm.name = name
		songdata.lastfm.artist = artist

		await songdata.getLastFMData (defer err, data)
		if err
			callback err, songdata

		await songdata.getGroovesharkData (defer err, data)
		if err
			callback err, songdata

		songdata.loaded = true
		callback null, songdata

	@fromMBID: (mbid, callback) ->
		await awaitable(lastfm.track.getInfo)
			mbid: mbid
		, (defer err, data)

		console.log(err, data)
		if err
			callback err, null

		if not data.track?
			callback new Error('Could not find track with mbid: ' + mbid), null

		songdata = SongData.fromLastFMData(data.track)
		await songdata.getGroovesharkData (defer err, data)
		if err
			callback err, songdata

		songdata.loaded = true
		callback null, songdata

	@fromLastFMData: (data) ->
		songdata = new SongData

		songdata.lastfm.id = data.id
		songdata.lastfm.mbid = data.mbid ? null
		songdata.lastfm.name = data.name
		songdata.lastfm.artist = data.artist?.name ? null
		songdata.lastfm.album = data.album?.title ? null
		songdata.lastfm.albumArt = SongData.parseLastFMImage(data.album?.image ? data.image)
		return songdata

	@fromGroovesharkData: (data) ->
		songdata = new SongData

		songdata.gs.id = data.SongID
		songdata.gs.name = data.SongName
		songdata.gs.artist = data.ArtistName
		songdata.gs.album = data.AlbumName
		songdata.gs.url = data.Url
		
		return songdata

	@parseLastFMImage: (images) ->
		if not images?
			return {}

		parsed = {}
		for image in images
			parsed[image.size] = image['#text']
		return parsed
			
	getSimilar: (limit, callback) =>
		f = new SimilarTrackFinder(limit)
		await f.find this.lastfm.name, this.lastfm.artist, (defer err, similar)

		if err
			console.log err
			return []

		items = []
		console.log 'SIMILAR', similar
		for track, i in similar.track
			newdata = SongData.fromLastFMData(track)
			await newdata.getGroovesharkData (defer err, items[i])

		callback null, items

	
class root.SongNode
	@maxChildren: 4

	constructor: (songdata, parent) ->
		this.song = songdata
		this.parent = parent ? null

		this.children = []
		this._expanded = false

	expand: (callback) =>
		if not this._expanded
			items = []
			await this.song.getSimilar SongNode.maxChildren, (defer err, items)
			this.children = (new SongNode(item, this) for item in items)

			# filter out items that are the same as this node's parent so
			# we don't toggle between two similar songs indefinitely
			if this.parent?
				this.children = this.children.filter (item) =>
					return item.song.id != this.parent.song.id or (item.song.id == '' and this.parent.song.id == '')

			this.children = this.children.slice(0, SongNode.maxChildren)

		this._expanded = true
		callback?(null, this)


class root.SimilarTrackFinder
	@defaultLimit: 4
	
	constructor: (limit) ->
		this.limit = limit ? TrackFinder.defaultLimit

	findById: (mbid, callback) =>
		awaitable(lastfm.track.getSimilar)
			mbid: mbid
			limit: this.limit
		, (err, data) =>
			if err
				callback err, null
			else
				callback this.parseResult(data)...

	find: (name, artist, callback) =>
		awaitable(lastfm.track.getSimilar)
			track: name
			artist: artist
			autocorrect: 1
			limit: this.limit
		, (err, data) =>
			if err
				callback err, null
			else
				callback this.parseResult(data)...

	parseResult: (data) ->
		console.log 'PARSING', data
		if not ('@attr' of data.similartracks)
			return [404, 'Song not Found']

		return [null, data.similartracks]
			
