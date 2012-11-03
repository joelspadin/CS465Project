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
        return this.lastfm.name;
      }
    });

    SongData.property('artist', {
      get: function() {
        return this.lasftm.artist;
      }
    });

    SongData.property('album', {
      get: function() {
        return this.lastfm.album;
      }
    });

    SongData.property('art', get(function() {
      return null;
    }));

    function SongData() {
      this.getSimilar = __bind(this.getSimilar, this);
      this.loaded = false;
      this.lastfm = {
        id: null,
        name: null,
        artist: null,
        album: null
      };
      this.gs = {
        id: null,
        name: null,
        artist: null,
        album: null,
        url: null
      };
    }

    SongData.create = function(name, artist, callback) {
      var err, fmdata, gsdata, songdata, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      songdata = new SongData;
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "SongData.create"
        });
        awaitable(lastfm.track.getInfo({
          track: name,
          artist: artist != null ? artist : null,
          autocorrect: 1
        }, (__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return fmdata = arguments[1];
            };
          })(),
          lineno: 51
        }))));
        __iced_deferrals._fulfill();
      })(function() {
        if (err) {
          callback(err, songdata);
          return;
        }
        songdata.lastfm.id = fmdata.track.mbid;
        songdata.lastfm.name = fmdata.track.name;
        songdata.lastfm.artist = fmdata.track.artist.name;
        songdata.lastfm.album = fmdata.track.album.title;
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            funcname: "SongData.create"
          });
          gs.search(name, artist, (__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                return gsdata = arguments[1];
              };
            })(),
            lineno: 62
          })));
          __iced_deferrals._fulfill();
        })(function() {
          if (err) {
            callback(err, songdata);
            return;
          }
          songdata.gs.id = gsdata.SongID;
          songdata.gs.name = gsdata.SongName;
          songdata.gs.artist = gsdata.ArtistName;
          songdata.gs.album = gs.data.AlbumName;
          songdata.gs.url = gs.data.Url;
          songdata.loaded = true;
          return callback(null, songdata);
        });
      });
    };

    SongData.prototype.getSimilar = function(callback) {
      var err, f, i, items, similar, track, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      f = new TrackFinder;
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "SongData.getSimilar"
        });
        f.find(_this.name, _this.artist, (__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              err = arguments[0];
              return similar = arguments[1];
            };
          })(),
          lineno: 79
        })));
        __iced_deferrals._fulfill();
      })(function() {
        if (err) {
          console.log(err);
          return [];
        }
        items = [];
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
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  funcname: "SongData.getSimilar"
                });
                SongData.create(track.name, track.artist, (__iced_deferrals.defer({
                  assign_fn: (function(__slot_1, __slot_2) {
                    return function() {
                      err = arguments[0];
                      return __slot_1[__slot_2] = arguments[1];
                    };
                  })(items, i),
                  lineno: 87
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
      this.expanded = false;
    }

    SongNode.prototype.expand = function(callback) {
      var err, item, items, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        if (!_this.expanded) {
          items = [];
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "SongNode.expand"
            });
            _this.song.getSimilar((__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  err = arguments[0];
                  return items = arguments[1];
                };
              })(),
              lineno: 104
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
        _this.expanded = true;
        return callback(null, _this);
      });
    };

    return SongNode;

  })();

}).call(this);
