(function() {
  var GroovesharkPlayer,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  GroovesharkPlayer = (function() {

    function GroovesharkPlayer() {
      this.setVolume = __bind(this.setVolume, this);

      this.sync = __bind(this.sync, this);

      this.seek = __bind(this.seek, this);

      this.playSong = __bind(this.playSong, this);

      this.enqueue = __bind(this.enqueue, this);

      this.pause = __bind(this.pause, this);

      this.play = __bind(this.play, this);

      this.onError = __bind(this.onError, this);

      this.onStatusChanged = __bind(this.onStatusChanged, this);

      this.onSongEnd = __bind(this.onSongEnd, this);

      this.init = __bind(this.init, this);

    }

    GroovesharkPlayer.prototype.player = null;

    GroovesharkPlayer.prototype.ready = false;

    GroovesharkPlayer.prototype.syncInterval = 5000;

    GroovesharkPlayer.prototype.deferredRequest = null;

    GroovesharkPlayer.prototype.init = function(player) {
      var actuallyInit,
        _this = this;
      this.player = player;
      vine.player.elems.seek.slider('disable');
      actuallyInit = function() {
        if (_this.player.setStatusCallback != null) {
          _this.ready = true;
          window.onSongEnd = _this.onSongEnd;
          window.onStatusChanged = _this.onStatusChanged;
          window.onError = _this.onError;
          _this.player.setStatusCallback('onStatusChanged');
          _this.player.setSongCompleteCallback('onSongEnd');
          _this.player.setErrorCallback('onError');
          if (_this.deferredRequest != null) {
            return _this.playSong(_this.deferredRequest);
          }
        } else {
          return setTimeout(actuallyInit, 100);
        }
      };
      return actuallyInit();
    };

    GroovesharkPlayer.prototype.onSongEnd = function() {
      return vine.player.playNext();
    };

    GroovesharkPlayer.prototype.onStatusChanged = function(status) {
      switch (status) {
        case 'loading':
          return vine.player._stopUpdate();
        case 'playing':
          if (!vine.player.playing) {
            return this.pause();
          } else {
            vine.player._stopUpdate();
            return vine.player._startUpdate();
          }
          break;
        case 'buffering':
          return vine.player._stopUpdate();
        case 'failed':
          console.log('AudoVine: Failed to play the song');
          return vine.player.playNext();
      }
    };

    GroovesharkPlayer.prototype.onError = function(error) {
      return console.log('AudioVine: Grooveshark error', error);
    };

    GroovesharkPlayer.prototype.play = function() {
      if (this.player != null) return this.player.resumeStream();
    };

    GroovesharkPlayer.prototype.pause = function() {
      if (this.player != null) return this.player.pauseStream();
    };

    GroovesharkPlayer.prototype.enqueue = function(song) {
      var _this = this;
      return $.ajax({
        url: '/api/songGetter.php',
        type: 'post',
        data: {
          song: song.song.gs.id
        },
        success: function(response) {
          var data;
          try {
            data = JSON.parse(response);
            return _this.playSong(data);
          } catch (err) {
            return console.log(err, response);
          }
        }
      });
    };

    GroovesharkPlayer.prototype.playSong = function(data) {
      if (this.player != null) {
        this.deferredRequest = null;
        this.player.playStreamKey(data.StreamKey, data.StreamServerHostname, data.StreamServerID);
        return vine.player.duration = data.uSecs / 1000000;
      } else {
        return this.deferredRequest = data;
      }
    };

    GroovesharkPlayer.prototype.seek = function(position) {};

    GroovesharkPlayer.prototype.sync = function() {};

    GroovesharkPlayer.prototype.setVolume = function(volume) {
      if (this.player != null) {
        return this.player.setVolume(Math.round(volume * 100));
      }
    };

    return GroovesharkPlayer;

  })();

  $(function() {
    window.vine.grooveshark = new GroovesharkPlayer;
    return swfobject.embedSWF('http://grooveshark.com/APIPlayer.swf', 'gs-player', '0', '0', '9.0.0', '', {}, {
      allowScriptAccess: "always"
    }, {
      id: "groovesharkPlayer",
      name: "groovesharkPlayer"
    }, function(e) {
      var player;
      player = e.ref;
      if (player) {
        return window.vine.grooveshark.init(player);
      } else {
        return console.log('AudioVine: Failed to load Grooveshark');
      }
    });
  });

}).call(this);
