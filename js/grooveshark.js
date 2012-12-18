(function() {
  var queryify, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = this;

  queryify = function(data) {
    var key, parts;
    parts = [];
    for (key in data) {
      parts.push(key + '=' + encodeURIComponent(data[key]));
    }
    return parts.join('&');
  };

  root.GrooveShark = (function() {
    var key;

    GrooveShark.endpoint = '/api/query-song.php';

    key = null;

    function GrooveShark(apikey) {
      this.search = __bind(this.search, this);
      key = apikey;
    }

    GrooveShark.prototype.query = function(query, callback) {
      var url;
      url = GrooveShark.endpoint + '?' + queryify(query);
      return $.getJSON(url).then(function(data) {
        return callback(null, data);
      }, function(err) {
        return callback(err, null);
      });
    };

    GrooveShark.prototype.search = function(query, limit, callback) {
      var single;
      single = false;
      if (!(arguments[2] != null)) {
        callback = arguments[1];
        limit = 1;
        single = true;
      }
      return this.query({
        query: query,
        limit: limit
      }, function(err, data) {
        var _ref;
        if (err) {
          return callback(err, data);
        } else {
          if (single) {
            data = (_ref = data != null ? data[0] : void 0) != null ? _ref : null;
          } else if (!(data != null)) {
            data = [];
          }
          return callback(null, data);
        }
      });
    };

    return GrooveShark;

  })();

}).call(this);
