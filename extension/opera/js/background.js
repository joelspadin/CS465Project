(function() {
  var root;

  root = this;

  root.player = null;

  root.grooveshark = null;

  root.connect = function() {
    if ((root.player != null) && (root.grooveshark != null)) {
      root.player.postMessage({
        action: 'connect'
      });
      root.grooveshark.postMessage({
        action: 'connect'
      });
      console.log('AudioVine: connected to Grooveshark');
    }
    return void 0;
  };

  root.disconnect = function() {
    if (root.player != null) {
      root.player.postMessage({
        action: 'disconnect'
      });
      console.log('AudioVine: disconnected from GrooveShark');
    }
    return void 0;
  };

  opera.extension.ondisconnect = function(e) {
    if (e.source === root.player) {
      root.player = null;
      root.disconnect();
      console.log('AudioVine: disconnected from extension');
    }
    if (e.source === root.grooveshark) {
      root.grooveshark = null;
      return root.disconnect();
    }
  };

  opera.extension.onmessage = function(e) {
    if (e.data.action === 'ready') {
      if (e.origin.indexOf('http://grooveshark.com/') === 0) {
        root.grooveshark = e.source;
        console.log('AudioVine: Grooveshark is ready');
      } else {
        root.player = e.source;
        console.log('AudioVine: Main site is ready');
      }
      root.connect();
    } else if (e.source === root.player) {
      if (root.grooveshark != null) {
        console.log('AudioVine: mirroring message to Grooveshark', e.data);
        root.grooveshark.postMessage(e.data);
      } else {
        console.log('AudioVine: failed to mirror message to Grooveshark');
      }
    } else if (e.source === root.grooveshark) {
      if (root.player != null) {
        console.log('AudioVine: mirroring message to Audio Vine', e.data);
        root.player.postMessage(e.data);
      } else {
        console.log('AudioVine: failed to mirror message to Audio Vine');
      }
    }
    return void 0;
  };

}).call(this);
