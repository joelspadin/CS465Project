class GroovesharkPlayer
	player: null
	ready: false
	syncInterval: 5000
	deferredRequest: null

	init: (player) =>
		this.player = player
		vine.player.elems.seek.slider('disable')

		actuallyInit = =>
			if this.player.setStatusCallback?
				
				this.ready = true
		
				window.onSongEnd = this.onSongEnd
				window.onStatusChanged = this.onStatusChanged
				window.onError = this.onError

				this.player.setStatusCallback('onStatusChanged')
				this.player.setSongCompleteCallback('onSongEnd')
				this.player.setErrorCallback('onError')
		
				if this.deferredRequest?
					this.playSong(this.deferredRequest)
			else
				setTimeout(actuallyInit, 100)
		
		actuallyInit()

	onSongEnd: () =>
		vine.player.playNext()

	onStatusChanged: (status) =>
		switch status
			when 'loading'
				vine.player._stopUpdate()
			when 'playing'
				if not vine.player.playing
					this.pause()
				else
					vine.player._stopUpdate()
					vine.player._startUpdate()
			when 'buffering'
				vine.player._stopUpdate()
			when 'failed'
				console.log('AudoVine: Failed to play the song')
				vine.player.playNext()
			
	onError: (error) =>
		console.log('AudioVine: Grooveshark error', error)

	play: =>
		if this.player?
			this.player.resumeStream()
		
	pause: =>
		if this.player?
			this.player.pauseStream()

	enqueue: (song) =>
		$.ajax
			url: '/api/songGetter.php'
			type: 'post'
			data:
				song: song.song.gs.id
			success: (response) =>
				try
					data = JSON.parse(response)
					this.playSong(data)
				catch err
					console.log(err, response)
				
	playSong: (data) =>
		if this.player?
			this.deferredRequest = null
			this.player.playStreamKey(data.StreamKey, data.StreamServerHostname, data.StreamServerID)
			vine.player.duration = data.uSecs / 1000000
		else
			this.deferredRequest = data


	seek: (position) =>

	sync: =>

	setVolume: (volume) =>
		if this.player?
			this.player.setVolume(Math.round(volume * 100))

	

$ ->
	window.vine.grooveshark = new GroovesharkPlayer

	swfobject.embedSWF 'http://grooveshark.com/APIPlayer.swf',
		'gs-player', '0', '0', '9.0.0', '', {}, 
		{allowScriptAccess: "always"}, 
		{id:"groovesharkPlayer", name:"groovesharkPlayer"},
		(e) ->
			player = e.ref
			if player
				window.vine.grooveshark.init(player)
			else
				console.log 'AudioVine: Failed to load Grooveshark'
		

	