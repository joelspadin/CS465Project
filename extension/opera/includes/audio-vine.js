// ==UserScript==
// @include http://localhost/cs465/*
// @include http://audio-vine.com/*
// ==/UserScript==

var oex = opera.extension;

window.addEventListener('DOMContentLoaded', function() {

	oex.postMessage({ action: 'ready' })
		
	var gs = window.vine.grooveshark = new function GroovesharkCommunicator() {
		this.ready = false;
		this.syncInterval = 5000;

		var syncTimer = -1;

		this.onconnect = function(data, e) {
			gs.ready = true;
			gs.sync();
			
		}

		this.ondisconnect = function() {
			gs.ready = false;
		}

		this.onsync = function(data) {
			if ('duration' in data)
				window.vine.player.duration = data.duration;
			if ('position' in data)
				window.vine.player.updatePosition(data.position);

			window.clearInterval(syncTimer);
			syncTimer = window.setInterval(gs.sync, gs.syncInterval)
		}

		this.onSongEnd = function(data) {
			window.vine.player.playNext();
		}



		this.play = function() {
			oex.postMessage({ action: 'play' });
		}

		this.pause = function() {
			oex.postMessage({ action: 'pause' });
		}

		this.enqueue = function(song) {
			oex.postMessage({ action: 'enqueue', song: song.song.gs.id })
		}

		this.seek = function(position) {
			oex.postMessage({ action: 'seek', position: position })
		}

		this.sync = function() {
			oex.postMessage({ action: 'sync' });
		}

		this.setVolume = function(volume) {
			oex.postMessage({ action: 'volume', value: volume });
		}
	}

	oex.onmessage = function(e) {
		var handler = handlers[e.data.action];
		if (handler)
			handler.apply(null, [e.data, e]);
		else
			console.log('Audio Vine: unknown message "' + e.data.action + '"', e);
	}

	var handlers = {
		connect: gs.onconnect,
		disconnect: gs.ondisconnect,
		sync: gs.onsync,
		'song end': gs.onSongEnd,
	}

}, false);