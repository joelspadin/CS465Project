(function() {
  var awaitable, iced, root, __iced_k, __iced_k_noop,
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

  Function.prototype.property = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

  awaitable = function(func) {
    return function() {
      var args, callback, _i;
      args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), callback = arguments[_i++];
      return func.apply(this, args.concat({
        success: function(result) {
          return callback(null, result);
        },
        error: function(err) {
          if (arguments.length > 1) err = Array.prototype.slice.apply(arguments);
          return callback(err, null);
        }
      }));
    };
  };

  root.SongData = (function() {

    SongData.property('id', {
      get: function() {
        var _ref;
        return (_ref = this.gs.id) != null ? _ref : this.lastfm.id;
      }
    });

    SongData.property('mbid', {
      get: function() {
        return this.lastfm.mbid;
      }
    });

    SongData.property('name', {
      get: function() {
        var _ref;
        return (_ref = this.gs.name) != null ? _ref : this.lastfm.name;
      }
    });

    SongData.property('artist', {
      get: function() {
        var _ref;
        return (_ref = this.gs.artist) != null ? _ref : this.lastfm.artist;
      }
    });

    SongData.property('artistUrl', {
      get: function() {
        var _ref;
        return (_ref = this.lastfm.artistUrl) != null ? _ref : null;
      }
    });

    SongData.property('album', {
      get: function() {
        var _ref;
        return (_ref = this.gs.album) != null ? _ref : this.lastfm.album;
      }
    });

    SongData.property('albumUrl', {
      get: function() {
        var _ref;
        return (_ref = this.lastfm.albumUrl) != null ? _ref : null;
      }
    });

    SongData.property('albumArt', {
      get: function() {
        var _ref, _ref1;
        return (_ref = (_ref1 = this.lastfm.albumArt) != null ? _ref1['small'] : void 0) != null ? _ref : null;
      }
    });

    SongData.property('largeAlbumArt', {
      get: function() {
        var _ref, _ref1;
        return (_ref = (_ref1 = this.lastfm.albumArt) != null ? _ref1['large'] : void 0) != null ? _ref : null;
      }
    });

    function SongData() {
      this.getSimilar = __bind(this.getSimilar, this);

      this.getGroovesharkData = __bind(this.getGroovesharkData, this);

      this.getLastFMData = __bind(this.getLastFMData, this);
      this.loaded = false;
      this.lastfm = {
        id: null,
        mbid: null,
        name: null,
        artist: null,
        artistUrl: null,
        album: null,
        albumArt: null,
        albumUrl: null,
        url: null
      };
      this.gs = {
        id: null,
        name: null,
        artist: null,
        album: null,
        url: null
      };
    }

    SongData.prototype.getLastFMData = function(callback) {
      var data, err, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        var _ref;
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "SongData.getLastFMData"
        });
        awaitable(lastfm.track.getInfo)({
          track: _this.name,
          artist: (_ref = _this.artist) != null ? _ref : null,
          autocorrect: 1
        }, (__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return data = arguments[1];
            };
          })(),
          lineno: 70
        })));
        __iced_deferrals._fulfill();
      })(function() {
        var _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
        if (err) {
          callback(err, _this);
          return;
        }
        _this.lastfm.id = data.track.id;
        _this.lastfm.mbid = (_ref = data.track.mbid) != null ? _ref : null;
        _this.lastfm.name = data.track.name;
        _this.lastfm.artist = (_ref1 = (_ref2 = data.track.artist) != null ? _ref2.name : void 0) != null ? _ref1 : null;
        _this.lastfm.artistUrl = (_ref3 = (_ref4 = data.track.artist) != null ? _ref4.url : void 0) != null ? _ref3 : null;
        _this.lastfm.album = (_ref5 = (_ref6 = data.track.album) != null ? _ref6.title : void 0) != null ? _ref5 : null;
        _this.lastfm.albumArt = SongData.parseLastFMImage((_ref7 = (_ref8 = data.track.album) != null ? _ref8.image : void 0) != null ? _ref7 : data.image);
        _this.lastfm.albumUrl = (_ref9 = (_ref10 = data.track.album) != null ? _ref10.url : void 0) != null ? _ref9 : null;
        _this.lastfm.url = data.track.url;
        return callback(null, _this);
      });
    };

    SongData.prototype.getGroovesharkData = function(callback) {
      var data, err, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "SongData.getGroovesharkData"
        });
        root.gs.search("" + _this.name + " " + _this.artist, (__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return data = arguments[1];
            };
          })(),
          lineno: 91
        })));
        __iced_deferrals._fulfill();
      })(function() {
        if (err) {
          callback(err, _this);
          return;
        }
        if (!(typeof data !== "undefined" && data !== null)) {
          callback(new Error("Cannot find '" + _this.name + " " + _this.artist + "' on Grooveshark"), _this);
          return;
        }
        _this.gs.id = data.SongID;
        _this.gs.name = data.SongName;
        _this.gs.artist = data.ArtistName;
        _this.gs.album = data.AlbumName;
        _this.gs.url = data.Url;
        return callback(null, _this);
      });
    };

    SongData.clone = function(song) {
      var songdata;
      songdata = new SongData;
      songdata.gs = song.gs;
      songdata.lastfm = song.lastfm;
      songdata.loaded = song.loaded;
      return songdata;
    };

    SongData.create = function(name, artist, callback) {
      var data, err, songdata, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      songdata = new SongData;
      songdata.lastfm.name = name;
      songdata.lastfm.artist = artist;
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "SongData.create"
        });
        songdata.getLastFMData((__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return data = arguments[1];
            };
          })(),
          lineno: 121
        })));
        __iced_deferrals._fulfill();
      })(function() {
        if (err) callback(err, songdata);
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            funcname: "SongData.create"
          });
          songdata.getGroovesharkData((__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                return data = arguments[1];
              };
            })(),
            lineno: 125
          })));
          __iced_deferrals._fulfill();
        })(function() {
          if (err) callback(err, songdata);
          songdata.loaded = true;
          return callback(null, songdata);
        });
      });
    };

    SongData.fromMBID = function(mbid, callback) {
      var data, err, songdata, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "SongData.fromMBID"
        });
        awaitable(lastfm.track.getInfo)({
          mbid: mbid
        }, (__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return data = arguments[1];
            };
          })(),
          lineno: 136
        })));
        __iced_deferrals._fulfill();
      })(function() {
        console.log(err, data);
        if (err) callback(err, null);
        if (!(data.track != null)) {
          callback(new Error('Could not find track with mbid: ' + mbid), null);
        }
        songdata = SongData.fromLastFMData(data.track);
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            funcname: "SongData.fromMBID"
          });
          songdata.getGroovesharkData((__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                return data = arguments[1];
              };
            })(),
            lineno: 145
          })));
          __iced_deferrals._fulfill();
        })(function() {
          if (err) callback(err, songdata);
          songdata.loaded = true;
          return callback(null, songdata);
        });
      });
    };

    SongData.fromLastFMData = function(data) {
      var songdata, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      songdata = new SongData;
      songdata.lastfm.id = data.id;
      songdata.lastfm.mbid = (_ref = data.mbid) != null ? _ref : null;
      songdata.lastfm.name = data.name;
      songdata.lastfm.artist = (_ref1 = (_ref2 = data.artist) != null ? _ref2.name : void 0) != null ? _ref1 : null;
      songdata.lastfm.artistUrl = (_ref3 = (_ref4 = data.artist) != null ? _ref4.url : void 0) != null ? _ref3 : null;
      songdata.lastfm.album = (_ref5 = (_ref6 = data.album) != null ? _ref6.title : void 0) != null ? _ref5 : null;
      songdata.lastfm.albumUrl = (_ref7 = (_ref8 = data.album) != null ? _ref8.url : void 0) != null ? _ref7 : null;
      songdata.lastfm.albumArt = SongData.parseLastFMImage((_ref9 = (_ref10 = data.album) != null ? _ref10.image : void 0) != null ? _ref9 : data.image);
      return songdata;
    };

    SongData.fromGroovesharkData = function(data) {
      var songdata;
      songdata = new SongData;
      songdata.gs.id = data.SongID;
      songdata.gs.name = data.SongName;
      songdata.gs.artist = data.ArtistName;
      songdata.gs.album = data.AlbumName;
      songdata.gs.url = data.Url;
      return songdata;
    };

    SongData.parseLastFMImage = function(images) {
      var image, parsed, _i, _len;
      if (!(images != null)) return {};
      parsed = {};
      for (_i = 0, _len = images.length; _i < _len; _i++) {
        image = images[_i];
        parsed[image.size] = image['#text'];
      }
      return parsed;
    };

    SongData.prototype.getSimilar = function(limit, callback) {
      var err, f, i, items, newdata, similar, songs, track, variance, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      variance = 2.5;
      f = new SimilarTrackFinder(Math.floor(limit * variance));
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "SongData.getSimilar"
        });
        f.find(_this.lastfm.name, _this.lastfm.artist, (__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return similar = arguments[1];
            };
          })(),
          lineno: 189
        })));
        __iced_deferrals._fulfill();
      })(function() {
        if (err) {
          console.log('Error:', err);
          callback(err, []);
          return;
        }
        items = [];
        songs = Array.prototype.slice.call(similar.track);
        while (songs.length > limit) {
          i = Math.floor(Math.random() * songs.length);
          songs.splice(i, 1);
        }
        (function(__iced_k) {
          var _i, _len, _ref, _results, _while;
          _ref = songs;
          _len = _ref.length;
          i = 0;
          _results = [];
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = function() {
              return __iced_k(_results);
            };
            _continue = function() {
              ++i;
              return _while(__iced_k);
            };
            _next = function(__iced_next_arg) {
              _results.push(__iced_next_arg);
              return _continue();
            };
            if (!(i < _len)) {
              return _break();
            } else {
              track = _ref[i];
              newdata = SongData.fromLastFMData(track);
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  funcname: "SongData.getSimilar"
                });
                newdata.getGroovesharkData((__iced_deferrals.defer({
                  assign_fn: (function(__slot_1, __slot_2) {
                    return function() {
                      err = arguments[0];
                      return __slot_1[__slot_2] = arguments[1];
                    };
                  })(items, i),
                  lineno: 206
                })));
                __iced_deferrals._fulfill();
              })(_next);
            }
          };
          _while(__iced_k);
        })(function() {
          items = items.filter(function(item) {
            return !!item.gs.id;
          });
          return callback(null, items);
        });
      });
    };

    return SongData;

  })();

  root.SongNode = (function() {

    SongNode.maxChildren = 4;

    function SongNode(songdata, parent) {
      this.expand = __bind(this.expand, this);
      this.song = songdata;
      this.parent = parent != null ? parent : null;
      this.children = [];
      this._expanded = false;
      this._expanding = false;
      this._expandingCallbacks = [];
      this.favorited = false;
    }

    SongNode.prototype.expand = function(callback) {
      var err, item, items, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        if (!_this._expanded) {
          if (_this._expanding) {
            _this._expandingCallbacks.push(callback);
            return;
          }
          _this._expanding = true;
          items = [];
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "SongNode.expand"
            });
            _this.song.getSimilar(SongNode.maxChildren, (__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  err = arguments[0];
                  return items = arguments[1];
                };
              })(),
              lineno: 237
            })));
            __iced_deferrals._fulfill();
          })(function() {
            _this.children = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = items.length; _i < _len; _i++) {
                item = items[_i];
                _results.push(new SongNode(item, this));
              }
              return _results;
            }).call(_this);
            if (_this.parent != null) {
              _this.children = _this.children.filter(function(item) {
                return item.song.id !== _this.parent.song.id || (item.song.id === '' && _this.parent.song.id === '');
              });
            }
            return __iced_k(_this.children = _this.children.slice(0, SongNode.maxChildren));
          });
        } else {
          return __iced_k();
        }
      })(function() {
        _this._expanded = true;
        _this._expanding = false;
        if (typeof callback === "function") callback(null, _this);
        _this._expandingCallbacks.forEach(function(item) {
          return typeof item === "function" ? item(null, _this) : void 0;
        });
        return _this._expandingCallbacks = [];
      });
    };

    return SongNode;

  })();

  root.SimilarTrackFinder = (function() {

    SimilarTrackFinder.defaultLimit = 4;

    function SimilarTrackFinder(limit) {
      this.find = __bind(this.find, this);

      this.findById = __bind(this.findById, this);
      this.limit = limit != null ? limit : TrackFinder.defaultLimit;
    }

    SimilarTrackFinder.prototype.findById = function(mbid, callback) {
      var _this = this;
      return awaitable(lastfm.track.getSimilar)({
        mbid: mbid,
        limit: this.limit
      }, function(err, data) {
        if (err) {
          return callback(err, null);
        } else {
          return callback.apply(null, _this.parseResult(data));
        }
      });
    };

    SimilarTrackFinder.prototype.find = function(name, artist, callback) {
      var _this = this;
      return awaitable(lastfm.track.getSimilar)({
        track: name,
        artist: artist,
        autocorrect: 1,
        limit: this.limit
      }, function(err, data) {
        if (err) {
          return callback(err, null);
        } else {
          return callback.apply(null, _this.parseResult(data));
        }
      });
    };

    SimilarTrackFinder.prototype.parseResult = function(data) {
      if (!('@attr' in data.similartracks)) return [404, 'Song not Found'];
      return [null, data.similartracks];
    };

    return SimilarTrackFinder;

  })();

}).call(this);
