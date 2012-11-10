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
        return this.lastfm.id;
      }
    });

    SongData.property('name', {
      get: function() {
        var _ref;
        return (_ref = this.lastfm.name) != null ? _ref : this.gs.name;
      }
    });

    SongData.property('artist', {
      get: function() {
        var _ref;
        return (_ref = this.lastfm.artist) != null ? _ref : this.gs.artist;
      }
    });

    SongData.property('album', {
      get: function() {
        var _ref;
        return (_ref = this.lastfm.album) != null ? _ref : this.gs.album;
      }
    });

    SongData.property('albumArt', {
      get: function() {
        var _ref;
        return (_ref = this.lastfm.albumArt['small']) != null ? _ref : null;
      }
    });

    SongData.property('largeAlbumArt', {
      get: function() {
        var _ref;
        return (_ref = this.lastfm.albumArt['large']) != null ? _ref : null;
      }
    });

    function SongData() {
      this.getSimilar = __bind(this.getSimilar, this);

      this.getGroovesharkData = __bind(this.getGroovesharkData, this);

      this.getLastFMData = __bind(this.getLastFMData, this);
      this.loaded = false;
      this.lastfm = {
        id: null,
        name: null,
        artist: null,
        album: null,
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
          lineno: 57
        })));
        __iced_deferrals._fulfill();
      })(function() {
        var _ref, _ref1, _ref2, _ref3, _ref4;
        if (err) {
          callback(err, _this);
          return;
        }
        _this.lastfm.id = data.track.id;
        _this.lastfm.name = data.track.name;
        _this.lastfm.artist = (_ref = (_ref1 = data.track.artist) != null ? _ref1.name : void 0) != null ? _ref : null;
        _this.lastfm.album = (_ref2 = (_ref3 = data.track.album) != null ? _ref3.title : void 0) != null ? _ref2 : null;
        _this.lastfm.albumArt = SongData.parseLastFMImage((_ref4 = data.track.album) != null ? _ref4.image : void 0);
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
          lineno: 75
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
          lineno: 98
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
            lineno: 102
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
      var songdata, _ref, _ref1, _ref2, _ref3, _ref4;
      songdata = new SongData;
      songdata.lastfm.id = data.mbid;
      songdata.lastfm.name = data.name;
      songdata.lastfm.artist = (_ref = (_ref1 = data.artist) != null ? _ref1.name : void 0) != null ? _ref : null;
      songdata.lastfm.album = (_ref2 = (_ref3 = data.album) != null ? _ref3.title : void 0) != null ? _ref2 : null;
      songdata.lastfm.albumArt = SongData.parseLastFMImage((_ref4 = data.album) != null ? _ref4.image : void 0);
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
      var err, f, i, items, newdata, similar, track, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      f = new SimilarTrackFinder(limit);
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
          lineno: 143
        })));
        __iced_deferrals._fulfill();
      })(function() {
        if (err) {
          console.log(err);
          return [];
        }
        items = [];
        console.log(similar);
        (function(__iced_k) {
          var _i, _len, _ref, _results, _while;
          _ref = similar.track;
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
                  lineno: 153
                })));
                __iced_deferrals._fulfill();
              })(_next);
            }
          };
          _while(__iced_k);
        })(function() {
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
    }

    SongNode.prototype.expand = function(callback) {
      var err, item, items, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        if (!_this._expanded) {
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
              lineno: 170
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
        return typeof callback === "function" ? callback(null, _this) : void 0;
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
      console.log('PARSING', data);
      if (!('@attr' in data.similartracks)) return [404, 'Song not Found'];
      return [null, data.similartracks];
    };

    return SimilarTrackFinder;

  })();

}).call(this);
