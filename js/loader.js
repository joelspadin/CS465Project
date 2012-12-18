// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
								   || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); },
			  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());

(function() {
	var animations = [];
	var fps = 30;

	window.showLoadingBar = function(container) {
		$(container).show();
		var divs = Array.prototype.slice.call($(container).find('div'));

		var spacing = 0.2;
		var fadeFrames = 20;

		var frame = 0;
		var frames = (spacing * fps * divs.length) + fadeFrames;

		var id = animations.length;
		animations.push(container);

		function draw() {
			if (!animations[id])
				return;

			setTimeout(function() {
				requestAnimationFrame(draw);
				
				var current = frame / fps;
				for (var i = 0; i < divs.length; i++) {
					var start = spacing * i;

					if (current < start)
						divs[i].style.opacity = 0;
					else
						divs[i].style.opacity = Math.max(0, 1 - ((current - start) / (fadeFrames / fps)));
				}

				frame += 1;
				if (frame >= frames)
					frame = 0;
			}, 1000 / fps);
		}
		draw();

		return id;
	}

	window.hideLoadingBar = function(id) {
		console.log(animations, id);
		$(animations[id]).hide();
		animations[id] = null;
	}

}());