(function() {
  var History, SearchBox, VinePlayer, formatTime, iced, relpath, root, __iced_k, __iced_k_noop,
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  iced = {
    Deferrals: (function() {

      function _Class(_arg) {
        this.continuation = _arg;
        this.count = 1;
        this.ret = null;
      }

      _Class.prototype._fulfill = function() {
        if (!--this.count) return this.continuation(this.ret);
      };

      _Class.prototype.defer = function(defer_params) {
        var _this = this;
        ++this.count;
        return function() {
          var inner_params, _ref;
          inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (defer_params != null) {
            if ((_ref = defer_params.assign_fn) != null) {
              _ref.apply(null, inner_params);
            }
          }
          return _this._fulfill();
        };
      };

      return _Class;

    })(),
    findDeferral: function() {
      return null;
    }
  };
  __iced_k = __iced_k_noop = function() {};

  root = this;

  History = root.History;

  $(function() {
    var query, viewname, _ref;
    $('.search-box').each(function(i, box) {
      return new SearchBox(box);
    });
    $('.loader').append($('<div>'), $('<div>'), $('<div>'), $('<div>'), $('<div>'), $('<div>'), $('<div>'), $('<div>'));
    $('#player-controls, #player-controls *:not(#player-info)').attr('unselectable', 'on');
    vine.player = new VinePlayer;
    _ref = relpath(vine.siteroot, location.pathname).partition('/'), viewname = _ref[0], _ref[1], query = _ref[2];
    if (viewname === 'search') {
      vine.search(query);
    } else if (viewname === 'player') {
      view.change('player');
      vine.pushState();
    } else {
      view.change('home');
      vine.pushState();
    }
    return History.Adapter.bind(window, 'statechange', function(e) {
      var state;
      state = History.getState();
      if (state !== vine.currentstate) {
        console.log(state, view.currentState);
        vine.currentState = state;
        if (state.data.view !== view.currentView) view.change(state.data.view);
        if (state.data.view === 'search' && (state.data.query != null) && state.data.query !== vine.currentQuery) {
          return vine.search(state.data.query);
        }
      }
    });
  });

  root.gs = new GrooveShark('67b088cec7b78a5b29a42a7124928c87');

  root.cache = new LastFMCache;

  root.lastfm = new LastFM({
    apiKey: '6e9f1f13f07ba5bcbfb0a8951811c80e',
    apiSecret: '4db7199ede1a06b27e6fd96705ddba49',
    cache: cache
  });

  root.vine = {
    siteroot: '/cs465',
    currentState: null,
    rootnode: null,
    maxSearchResults: 20,
    currentQuery: null,
    player: null,
    pushState: function(state, path) {
      state = state != null ? state : {};
      path = path != null ? path : '';
      state.view = view.currentView;
      return History.pushState(state, '', vine.siteroot + view.getPath(view.currentView) + path);
    },
    search: function(query) {
      var candidates, data, err, result, results, song, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      vine.currentQuery = query;
      $('.search-query').text(query);
      vine.resetSearchResults();
      view.change('search');
      vine.pushState({
        query: query
      }, query);
      vine.showResultsSpinner();
      results = [];
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "search"
        });
        gs.search(query, vine.maxSearchResults, (__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return candidates = arguments[1];
            };
          })(),
          lineno: 83
        })));
        __iced_deferrals._fulfill();
      })(function() {
        (function(__iced_k) {
          var _i, _len;
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            funcname: "search"
          });
          for (_i = 0, _len = candidates.length; _i < _len; _i++) {
            result = candidates[_i];
            data = SongData.fromGroovesharkData(result);
            data.getLastFMData((__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return err = arguments[0];
                };
              })(),
              lineno: 87
            })));
            if (!err) results.push(data);
          }
          __iced_deferrals._fulfill();
        })(function() {
          var _i, _len, _results;
          vine.hideResultsSpinner();
          if (err) {
            return vine.showNoResults();
          } else if (results.length === 0) {
            return vine.showNoResults();
          } else {
            vine.fadeInSearchResults();
            _results = [];
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              song = results[_i];
              _results.push(vine.addSearchResult(song));
            }
            return _results;
          }
        });
      });
    },
    selectSong: function(song) {
      view.change('player');
      vine.rootnode = new SongNode(song);
      vine.pushState({
        rootnode: vine.rootnode
      });
      vine.resetSearchResults();
      vine.currentQuery = null;
      return vine.player.init(vine.rootnode);
    },
    resetSearchResults: function() {
      vine.hideSearchResults();
      vine.hideResultsSpinner();
      vine.hideNoResults();
      vine.clearSearchResults();
      return $('#view-search .search-box input[type=text]').val('');
    },
    showSearchResults: function() {
      return $('#search-results').show();
    },
    hideSearchResults: function() {
      return $('#search-results').hide();
    },
    fadeInSearchResults: function() {
      return $('#search-results').fadeIn();
    },
    fadeOutSearchResults: function() {
      return $('#search-results').fadeOut();
    },
    clearSearchResults: function() {
      return $('#search-results tbody').empty();
    },
    addSearchResult: function(song) {
      var table;
      table = $('#search-results tbody');
      return table.append($('<tr>').append($('<td>').text(song.name), $('<td>').text(song.artist), $('<td>').text(song.album)).click(function(e) {
        return vine.selectSong(song);
      }));
    },
    showResultsSpinner: function() {
      return $('#getting-results').show();
    },
    hideResultsSpinner: function() {
      return $('#getting-results').hide();
    },
    showNoResults: function() {
      $('#no-results').show();
      return $('#showing-results').hide();
    },
    hideNoResults: function() {
      $('#no-results').hide();
      return $('#showing-results').show();
    }
  };

  root.view = {
    currentView: 'home',
    views: {
      'home': '/',
      'search': '/search/',
      'player': '/player/'
    },
    select: function(name) {
      return $('#view-' + name);
    },
    change: function(name) {
      var path, v, _ref;
      _ref = view.views;
      for (v in _ref) {
        path = _ref[v];
        if (v === name) {
          view.select(v).show();
        } else {
          view.select(v).hide();
        }
      }
      return view.currentView = name;
    },
    getPath: function(name) {
      return view.views[name];
    }
  };

  Function.prototype.property = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

  VinePlayer = (function() {
    var currentSong, duration, lastIntervalTime, playedSongs, playing, position, positionTimer, queue, volume;

    volume = 1;

    playing = false;

    currentSong = null;

    position = 0;

    duration = 0;

    positionTimer = -1;

    lastIntervalTime = 0;

    queue = [];

    playedSongs = [];

    function VinePlayer() {
      this.playPrevious = __bind(this.playPrevious, this);

      this.playNext = __bind(this.playNext, this);

      this.wasPlayed = __bind(this.wasPlayed, this);

      this.isQueued = __bind(this.isQueued, this);

      this.enqueueAutomaticSong = __bind(this.enqueueAutomaticSong, this);

      this.dequeue = __bind(this.dequeue, this);

      this.enqueue = __bind(this.enqueue, this);

      this.seek = __bind(this.seek, this);

      this.pause = __bind(this.pause, this);

      this.play = __bind(this.play, this);

      this.updatePosition = __bind(this.updatePosition, this);

      this._startUpdate = __bind(this._startUpdate, this);

      this._stopUpdate = __bind(this._stopUpdate, this);

      this._interval = __bind(this._interval, this);

      this.init = __bind(this.init, this);

      var _this = this;
      this.elems = {
        favorite: $('#btn-favorite'),
        prev: $('#btn-prev'),
        playpause: $('#btn-playpause'),
        next: $('#btn-next'),
        art: $('#album-art'),
        song: $('#song-name'),
        artist: $('#artist-name'),
        currentTime: $('#current-time'),
        totalTime: $('#total-time'),
        seek: $('#ctrl-seek'),
        volume: $('#ctrl-volume')
      };
      this.goBackThreshold = 3;
      this.elems.playpause.click(function(e) {
        if (_this.playing) {
          return _this.pause();
        } else {
          return _this.play();
        }
      });
      this.elems.prev.click(function(e) {
        return _this.playPrevious();
      });
      this.elems.next.click(function(e) {
        return _this.playNext();
      });
      this.elems.seek.slider({
        range: 'min',
        min: 0,
        max: 0,
        value: 0,
        slide: function(e, ui) {
          return _this.elems.currentTime.text(formatTime(ui.value));
        },
        start: function(e, ui) {
          return _this._stopUpdate();
        },
        stop: function(e, ui) {
          _this.seek(ui.value);
          if (_this.playing) return _this._startUpdate();
        }
      });
    }

    VinePlayer.prototype.init = function(firstSong) {
      queue = [];
      playedSongs = [];
      currentSong = firstSong;
      this.updatePosition(0);
      return this.play();
    };

    VinePlayer.prototype._interval = function() {
      var delta, now;
      now = Date.now();
      delta = (now - lastIntervalTime) / 1000;
      lastIntervalTime = now;
      return this.updatePosition(this.position + delta);
    };

    VinePlayer.prototype._stopUpdate = function() {
      return window.clearInterval(positionTimer);
    };

    VinePlayer.prototype._startUpdate = function() {
      lastIntervalTime = Date.now();
      return positionTimer = window.setInterval(this._interval, 500);
    };

    VinePlayer.prototype.updatePosition = function(time) {
      position = Math.min(time, this.duration);
      this.elems.seek.slider({
        value: position
      });
      return this.elems.currentTime.text(formatTime(position));
    };

    VinePlayer.property('volume', {
      get: function() {
        return volume;
      },
      set: function(val) {
        return volume = val;
      }
    });

    VinePlayer.property('playing', {
      get: function() {
        return playing;
      },
      set: function(val) {
        playing = !!val;
        if (playing) {
          return this.elems.playpause.addClass('pause');
        } else {
          return this.elems.playpause.removeClass('pause');
        }
      }
    });

    VinePlayer.property('currentSong', {
      get: function() {
        return currentSong;
      }
    });

    VinePlayer.property('position', {
      get: function() {
        return position;
      }
    });

    VinePlayer.property('duration', {
      get: function() {
        return duration;
      },
      set: function(val) {
        duration = val;
        this.elems.seek.slider({
          max: val
        });
        return this.elems.totalTime.text(formatTime(val));
      }
    });

    VinePlayer.property('queue', {
      get: function() {
        return queue;
      }
    });

    VinePlayer.property('playedSongs', {
      get: function() {
        return playedSongs;
      }
    });

    VinePlayer.prototype.play = function() {
      if (!this.playing) {
        this._stopUpdate();
        this._startUpdate();
        return this.playing = true;
      }
    };

    VinePlayer.prototype.pause = function() {
      if (this.playing) {
        this._stopUpdate();
        return this.playing = false;
      }
    };

    VinePlayer.prototype.seek = function(time) {
      return this.updatePosition(time);
    };

    VinePlayer.prototype.enqueue = function(songnode) {
      queue.remove(songnode);
      return queue.push(songnode);
    };

    VinePlayer.prototype.dequeue = function(songnode) {
      return queue.remove(songnode);
    };

    VinePlayer.prototype.enqueueAutomaticSong = function() {
      return this.enqueue(null);
    };

    VinePlayer.prototype.isQueued = function(songnode) {
      return queue.contains(songnode);
    };

    VinePlayer.prototype.wasPlayed = function(songnode) {
      return playedSongs.contains(songnode);
    };

    VinePlayer.prototype.playNext = function() {
      var lastPlayed;
      lastPlayed = currentSong;
      currentSong = queue.shift();
      if (this.currentSong != null) {
        playedSongs.push(lastPlayed);
        this.updatePosition(0);
        return this.play();
      } else {
        this.enqueueAutomaticSong();
        return this.playNext();
      }
    };

    VinePlayer.prototype.playPrevious = function() {
      if (playedSongs.length > 0 && position < this.goBackThreshold) {
        queue.unshift(currentSong);
        currentSong = playedSongs.pop();
        this.updatePosition(0);
        if (this.playing) return this.play();
      } else {
        this.seek(0);
        if (this.playing) return this.play();
      }
    };

    return VinePlayer;

  })();

  SearchBox = (function() {

    function SearchBox(elem) {
      var _this = this;
      this.elem = $(elem);
      this.input = this.elem.find('input[type=text]');
      this.submit = this.elem.find('input[type=button]');
      this.input.keypress(function(e) {
        if (e.which === 13) return _this.go();
      });
      this.submit.click(function() {
        return _this.go();
      });
    }

    SearchBox.property('query', {
      get: function() {
        return this.input.val().trim();
      },
      set: function(q) {
        return this.input.val(q);
      }
    });

    SearchBox.prototype.go = function() {
      if (this.query.trim() === '') return;
      vine.search(this.query);
      return this.query = '';
    };

    return SearchBox;

  })();

  relpath = function(base, path) {
    var end, filter, i, remaining, _i, _len;
    filter = function(part) {
      return !!part.trim();
    };
    path = path.split('/').filter(filter);
    base = base.split('/').filter(filter);
    end = Math.min(path.length, base.length);
    i = 0;
    while (i < end) {
      if (path[i] === base[i]) {
        path.shift();
        base.shift();
      }
      i++;
    }
    for (_i = 0, _len = base.length; _i < _len; _i++) {
      remaining = base[_i];
      path.unshift('..');
    }
    return path.join('/');
  };

  formatTime = function(time) {
    var mins, secs;
    mins = Math.floor(time / 60).toString();
    secs = Math.round(time % 60).toString();
    return '00'.substr(mins.length) + mins + ':' + '00'.substr(secs.length) + secs;
  };

  String.prototype.partition = function(sep) {
    var _index;
    if ((_index = this.indexOf(sep)) >= 0) {
      return [this.substr(0, _index), sep, this.substr(_index + sep.length)];
    } else {
      return [this.toString(), '', ''];
    }
  };

  Array.prototype.contains = function(item) {
    var x, _i, _len;
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      x = this[_i];
      if (x === item) return true;
    }
    return false;
  };

  Array.prototype.remove = function(item) {
    var i, _results;
    i = 0;
    _results = [];
    while (i < this.length) {
      if (this[i] === item) {
        _results.push(this.splice(i, 1));
      } else {
        _results.push(i += 1);
      }
    }
    return _results;
  };

}).call(this);
