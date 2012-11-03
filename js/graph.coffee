root = this

Function::property = (prop, desc) ->
	Object.defineProperty @prototype, prop, desc

awaitable = (func) ->
	return (args..., callback) ->
		func.apply this, args.concat 
			success: (result) -> callback(null, result)
			error: (err) -> callback(err, null)

class root.SongData
	@property 'id',
		get: -> this.lastfm.id

	@property 'name',
		get: -> this.lastfm.name

	@property 'artist',
		get: -> this.lasftm.artist

	@property 'album',
		get: -> this.lastfm.album

	@property 'art',
		get -> null

	constructor: () ->
		this.loaded = false

		this.lastfm = 
			id: null
			name: null
			artist: null
			album: null

		this.gs = 
			id: null
			name: null
			artist: null
			album: null
			url: null

	@create: (name, artist, callback) ->
		songdata = new SongData
		await awaitable lastfm.track.getInfo
			track: name,
			artist: artist ? null
			autocorrect: 1
		, (defer err, fmdata)

		if err
			callback err, songdata
			return
		
		songdata.lastfm.id = fmdata.track.mbid
		songdata.lastfm.name = fmdata.track.name
		songdata.lastfm.artist = fmdata.track.artist.name
		songdata.lastfm.album = fmdata.track.album.title

		await gs.search name, artist, (defer err, gsdata)

		if err
			callback err, songdata
			return

		songdata.gs.id = gsdata.SongID
		songdata.gs.name = gsdata.SongName
		songdata.gs.artist = gsdata.ArtistName
		songdata.gs.album = gs.data.AlbumName
		songdata.gs.url = gs.data.Url

		songdata.loaded = true
		callback null, songdata
			
	getSimilar: (callback) =>
		f = new TrackFinder
		await f.find this.name, this.artist, (defer err, similar)

		if err
			console.log err
			return []

		items = []
		for track, i in similar.track
			await SongData.create track.name, track.artist, (defer err, items[i])

		callback null, items

	
class root.SongNode
	@maxChildren: 4

	constructor: (songdata, parent) ->
		this.song = songdata
		this.parent = parent ? null

		this.children = []
		this.expanded = false

	expand: (callback) =>
		if not this.expanded
			items = []
			await this.song.getSimilar (defer err, items)
			this.children = (new SongNode(item, this) for item in items)

			# filter out items that are the same as this node's parent so
			# we don't toggle between two similar songs indefinitely
			if this.parent?
				this.children = this.children.filter (item) =>
					return item.song.id != this.parent.song.id or (item.song.id == '' and this.parent.song.id == '')

			this.children = this.children.slice(0, SongNode.maxChildren)

		this.expanded = true
		callback(null, this)


