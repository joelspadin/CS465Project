(function() {
  var History, SearchBox, iced, relpath, root, __iced_k, __iced_k_noop,
    __slice = [].slice;

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
          lineno: 74
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
            console.log('Getting LastFM data for', result);
            data = SongData.fromGroovesharkData(result);
            data.getLastFMData((__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return err = arguments[0];
                };
              })(),
              lineno: 78
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
      return vine.currentQuery = null;
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

  String.prototype.partition = function(sep) {
    var _index;
    if ((_index = this.indexOf(sep)) >= 0) {
      return [this.substr(0, _index), sep, this.substr(_index + sep.length)];
    } else {
      return [this.toString(), '', ''];
    }
  };

}).call(this);
