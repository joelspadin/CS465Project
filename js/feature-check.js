(function() {
  var features,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  features = {
    modernizr: {
      required: {
        cors: 'Cross-origin Resource Sharing',
        svg: 'Scalable Vector Graphics',
        inlinesvg: 'Inline Scalable Vector Graphics',
        history: 'HTML5 history API',
        localstorage: 'Web Storage'
      },
      optional: {
        mediaqueries: 'CSS media queries',
        csstransitions: 'CSS transitions',
        boxsizing: 'CSS box-sizing property'
      }
    },
    window: {
      required: {
        FormData: 'FormData object'
      }
    },
    test: function() {
      var desc, feat, opt, req, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      req = [];
      opt = [];
      _ref = features.modernizr.required;
      for (feat in _ref) {
        desc = _ref[feat];
        if (!Modernizr[feat]) req.push(desc);
      }
      _ref1 = features.window.required;
      for (feat in _ref1) {
        desc = _ref1[feat];
        if (_ref2 = !feat, __indexOf.call(window, _ref2) >= 0) req.push(desc);
      }
      _ref3 = features.modernizr.optional;
      for (feat in _ref3) {
        desc = _ref3[feat];
        if (!Modernizr[feat]) opt.push(desc);
      }
      _ref4 = features.window.optional;
      for (feat in _ref4) {
        desc = _ref4[feat];
        if (_ref5 = !feat, __indexOf.call(window, _ref5) >= 0) opt.push(desc);
      }
      return {
        required: req,
        optional: opt
      };
    }
  };

  $(function() {
    var feature, list, optional, required, _i, _len, _ref, _results;
    _ref = features.test(), required = _ref.required, optional = _ref.optional;
    if (required.length > 0) {
      $('#features').show();
      list = $('#missing-features');
      _results = [];
      for (_i = 0, _len = required.length; _i < _len; _i++) {
        feature = required[_i];
        _results.push(list.append($('<li>').text(feature)));
      }
      return _results;
    }
  });

}).call(this);
