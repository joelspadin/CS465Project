// ==UserScript==
// @include http://grooveshark.com/*
// @include http://*.grooveshark.com/*
// ==/UserScript==
var oex = opera.extension;

// Fix Grooveshark's code
window.opera.addEventListener('BeforeScript', function(e) {
	if (e.element.hasAttribute('src') && e.element.src.indexOf('app_') >= 0) {
		e.element.text = e.element.text.replace(/getQueueSongListFromSongIDs\s*:.+{.+}\s*,\s*getSongFromToken/, function(match) {
			console.log('AudioVine: Fixed app.js');
			return match.replace('i.send(', 'return i.send(').replace('return return', 'return');
		});
	}
}, false);

window.addEventListener('load', function() {
	
	var gs = window.Grooveshark;
	var playWhenLoadedTimer = -1;
	var playWhenLoadedSong = -1;
	var ignoreFirstNullSong = true;
	var firstPlayHacketyHack = true;

	oex.postMessage({ action: 'ready' })

	opera.extension.onmessage = function(e) {
		var handler = handlers[e.data.action];
		if (handler)
			handler.apply(null, [e.data, e]);
		else
			console.log('Audio Vine (GS): unknown message "' + e.data.action + '"', e);
	}

	var handlers = {
		connect: onconnect,
		disconnect: ondisconnect,
		play: onplay,
		pause: onpause,
		enqueue: onenqueue,
		sync: onsync,
		seek: onseek,
		volume: onSetVolume,
	}

	function onconnect(data, e) {
		console.log('Audio Vine (GS): connected');
	}

	function ondisconnect() {
		console.log('Audio Vine (GS): disconnected');
	}

	function onplay() {
		gs.play();
	}

	function onpause() {
		gs.pause();
	}

	function onenqueue(data) {
		gs.addSongsByID([data.song]);
		playWhenLoadedTimer = window.setInterval(tryNextSong, 500);
		playWhenLoadedSong = data.song;
	}

	function tryNextSong() {
		gs.next();
	}

	function onsync() {
		var data = getSongStatus();
		data.action = 'sync';
		oex.postMessage(data);
	}

	function onseek(data) {
		gs.seekToPosition(data.position * 1000);
	}

	function onSetVolume(data) {
		gs.setVolume(Math.floor(data.value * 100));
	}

	function getSongStatus(song) {
		song = song || gs.getCurrentSongStatus().song;
		var data = {};

		if (song) {
			data.duration = getDuration(song);
			data.position = getPosition(song);
		} else {

		}
		return data;
	}

	gs.setSongStatusCallback(function(e) {
		console.log(e);
		if (e.song) {
			if (e.status === 'completed') {
				oex.postMessage({ action: 'song end' });
			} else {
				if (playWhenLoadedSong == e.song.songID) {
					window.clearInterval(playWhenLoadedTimer);
					playWhenLoadedSong = -1;

					if (firstPlayHacketyHack) {
						window.$('#play-pause').click();
						firstPlayHacketyHack = false;
					} else
						gs.play();
					console.log('AudioVine: Played next song');
				}

				var data = getSongStatus(e.song);
				data.action = 'sync';
				oex.postMessage(data);
			}
		}
	});



	function getDuration(song) {
		return (song.calculatedDuration || song.estimateDuration || 0) / 1000;
	}

	function getPosition(song) {
		return song.position / 1000;
	}

}, false);