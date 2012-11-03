(function() {
  var History, SearchBox, relpath, root;

  root = this;

  History = root.History;

  $(function() {
    var query, viewname, _ref;
    $('.search-box').each(function(i, box) {
      return new SearchBox(box);
    });
    _ref = relpath(vine.siteroot, location.pathname).partition('/'), viewname = _ref[0], _ref[1], query = _ref[2];
    if (viewname === 'search') {
      vine.search(query);
    } else if (viewname === 'player') {
      console.log('Player should happen here');
      view.change('player');
      vine.pushState();
    } else {
      view.change('home');
      vine.pushState();
    }
    return History.Adapter.bind(window, 'statechange', function() {
      var state;
      state = History.getState();
      console.log('statechange:', state);
      if (state.data.view !== view.currentView) {
        return view.change(state.data.view);
      }
    });
  });

  root.vine = {
    siteroot: '/cs465',
    search: function(query) {
      $('#search-query').text(query);
      view.change('search');
      return vine.pushState({
        query: query
      }, query);
    },
    pushState: function(state, path) {
      state = state != null ? state : {};
      path = path != null ? path : '';
      state.view = view.currentView;
      return History.pushState(state, '', vine.siteroot + view.getPath(view.currentView) + path);
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
      this.submit = this.elem.find('intput[type=button]');
      this.input.keypress(function(e) {
        if (e.which === 13) return _this.go();
      });
      this.submit.click(function() {
        return _this.go();
      });
    }

    SearchBox.property('query', {
      get: function() {
        return this.input.val();
      },
      set: function(q) {
        return this.input.val(q);
      }
    });

    SearchBox.prototype.go = function() {
      return vine.search(this.query);
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
