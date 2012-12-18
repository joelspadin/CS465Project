$(function() {

	var currentHover = null;

	var margins = [20, 120, 20, 120];

	var height = window.innerHeight;
	var width = window.innerWidth;

	var i = 0;
	var z = 0;
	var dist = 400;

	var nodeHeight = 66;
	var nodeHeightExp = 90;
	var nodeWidth = 202;

	var nodeHeightZoom = 54;
	var nodeWidthZoom = 54;
	
	var maxX = 0;

	var tree = d3.layout.tree().size([height, width]);
	var heightMod = 1;

	var panBase = [((width - nodeWidth - dist) / 2), -60];
	var currentPan = [0, 0];

	var diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });

	var zoom = d3.behavior.zoom().on('zoom', pan);

	var vis = d3.select("#vine").append("svg:svg")
		.attr("id", "test")
		.attr("height", "100%")
		.attr("width", "100%")
		.call(zoom)
		.on("dblclick.zoom", null)
		.on("mousewheel.zoom", changeLevel)
		.append("svg:g")
			.attr("transform", "translate(" + panBase + ")")
			.attr("id", "tree");

	var legend = vis.append('svg:g')
		.attr('transform', 'translate(0, 100)')
		.attr('id', 'tutorial');

	legend.append('svg:text')
		.attr('y', '26px')
		.attr('class', 'header')
		.text('How does this work?');

	legend.append('svg:line')
		.attr('stroke', '#000')
		.attr('stroke-width', '1px')
		.attr('x1', 0)
		.attr('x2', 242)
		.attr('y1', 31.5)
		.attr('y2', 31.5);
	
	([
		['black', 'white', 'Songs you haven\'t played'],
		['blue', '#A8A8FF', 'Songs you\'ve already played'],
		['green', '#B7F7B7', 'The currently playing song'],
		['purple', '#D9ABD9', 'Songs queued to play next'],
		['purple', '#f2e4f5', 'Plays if you don\'t queue a song'],
	]).forEach(function(def, i) {
		var stroke = def[0];
		var fill = def[1];
		var text = def[2];

		legend.append('svg:rect')
			.attr('x', 1.5)
			.attr('y', i * 20 + 38.5)
			.attr('width', '22px')
			.attr('height', '16px')
			.attr('rx', '2px')
			.attr('ry', '2px')
			.attr('stroke', stroke)
			.attr('fill', fill);

		legend.append('svg:text')
			.attr('x', '30px')
			.attr('y', i * 20 + 38 + 14)
			.text(text);
	});



	function updateNode(err, node) {
		update(node);
	}

	function getNodeClip(d) {
		return 'url(#clip-' + d.id + ')';
	}

	window.update = function(source) {

		var duration = d3.event && d3.event.altKey ? 1000 : 250;



		var nodes = tree.nodes(vine.rootnode).reverse();

		var currentMaxX = 0;

		nodes.forEach(function(d) {
			if (z == 0) {
				d.y = d.depth * dist;
			} else {
				d.y = d.depth * 150;
			}

			d.lX = d.x + nodeHeight / 2;

			d.lStartYm = d.y + nodeWidth;
			d.lStartYz = d.y + nodeWidthZoom;
			
			currentMaxX = Math.max(currentMaxX, d.y);

		});
		
		if (z == 0) {
			maxX = Math.max(maxX, currentMaxX);
		}
		else {
			maxX = Math.min(maxX, currentMaxX - 150);
		}

		var node = vis.selectAll("g.node")
			.data(nodes, function(d) { return d.id || (d.id = ++i); });

		var nodeClip = node.enter().append('svg:clipPath')
			.attr('transform', 'translate(0, 0)')
			.attr('id', function(d) { return 'clip-' + d.id; })
			.append('svg:rect')
				.attr('width', nodeWidth)
				.attr('height', nodeHeight - 2);

		var nodeEnter = node.enter().append("svg:g")
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
			.on("click", nodeClick)
			.on("mouseover", nodeOver);

		nodeEnter.append("svg:rect")
			.attr("height", nodeHeight)
			.attr("width", nodeWidth)
			.attr("class", "nodeBG")
			.attr("rx", "3px")
			.attr("ry", "3px")
			.style("stoke", "black")
			.style("fill", "white");

		nodeEnter.append("svg:image")
			.attr("xlink:href", function(d) {
				return d.song.albumArt ? d.song.albumArt : "/img/no-album-black.svg";
			})
			.attr("width", "48px")
			.attr("height", "48px")
			.attr("x", "9px")
			.attr("y", "9px")
			.attr("class", "albumArt");

		nodeEnter.append("svg:text")
			.attr("x", "65px")
			.attr("y", "26px")
			.attr('width', '130px')
			.attr("class", "ellipsis name")
			.attr('clip-path', getNodeClip)
			.text(function(d) {
				return d.song.name || 'No Title';
			});

		nodeEnter.append("svg:text")
			.attr("x", "65px")
			.attr("y", "51px")
			.attr('width', '130px')
			.attr("class", "ellipsis artist")
			.attr('clip-path', getNodeClip)
			.text(function(d) {
				return d.song.artist || 'No Artist';
			});

		nodeEnter.append("svg:text")
			.attr("text-anchor", "middle")
			.attr("x", "33px")
			.attr("y", "75px")
			.attr("width", "100px")
			.attr("class", "ellipsis zoomName")
			.text(function(d) {
				return d.song.name || 'No Title';
			})
			.style("opacity", 0.0);

		// Queue indicator
		nodeEnter.append('svg:rect')
			.attr('width', 18 + 2)
			.attr('height', 16 + 1)
			.attr('x', nodeWidth - 18 - 1)
			.attr('y', -1)
			.attr("rx", "3px")
			.attr("ry", "3px")
			.attr('class', 'queueIndicator')
			.attr('fill', 'purple')
			.style('opacity', 0);

		nodeEnter.append('svg:text')
			.attr('x', nodeWidth - 9)
			.attr('y', 12)
			.attr('class', 'queueIndicator')
			.style('text-anchor', 'middle')
			.style('text-weight', 'bold')
			.style('fill', 'white')
			.style('font-size', '12px')
			.text('-')
			.style('opacity', 0);

		// Loading spinner
		nodeEnter.append('svg:image')
			.attr('class', 'loader')
			.attr('x', nodeWidth + 8)
			.attr('y', (nodeHeight - 24) / 2)
			.attr('width', 24)
			.attr('height', 24)
			.attr('xlink:href', '/img/spinner.gif')
			.style('display', 'none')


		var controls = nodeEnter.append("svg:g")
			.attr("class", "nodeControls")
			.attr('clip-path', getNodeClip);

		controls.append("svg:rect")
			.attr("width", "64px")
			.attr("height", "0px")
			.attr("x", "1px")
			.attr("y", "65px")
			.style("opacity", 0.0)
			.on("click", playClick)
			.on("mousedown", playDown)
			.on("mouseup", playUp)
			.on("mouseover", playOver)
			.on("mouseout", playOut);


		controls.append("svg:rect")
			.attr("width", "64px")
			.attr("height", "0px")
			.attr("x", "65px")
			.attr("y", "65px")
			.style("opacity", 0.0)
			.on("click", queueClick)
			.on("mousedown", queueDown)
			.on("mouseup", queueUp)
			.on("mouseover", queueOver)
			.on("mouseout", queueOut);


		controls.append("svg:rect")
			.attr("width", "36px")
			.attr("height", "0px")
			.attr("x", "129px")
			.attr("y", "65px")
			.style("opacity", 0.0)
			.on("click", favClick)
			.on("mousedown", favDown)
			.on("mouseup", favUp)
			.on("mouseover", favOver)
			.on("mouseout", favOut);


		controls.append("svg:rect")
			.attr("width", "36px")
			.attr("height", "0px")
			.attr("x", "165px")
			.attr("y", "65px")
			.style("opacity", 0.0)
			.on("click", infoClick)
			.on("mousedown", infoDown)
			.on("mouseup", infoUp)
			.on("mouseover", infoOver)
			.on("mouseout", infoOut);

		controls.append("svg:image")
			.attr("xlink:href", "/img/buttons.svg")
			.attr("width", "200px")
			.attr("height", "0px")
			.attr("x", "1px")
			.attr("y", "65px")
			.attr("class", "buttonsOverlay")
			.attr("preserveAspectRatio", "xMidYMin slice")
			.attr("pointer-events", "none");

		controls.append("svg:image")
			.attr("xlink:href", "/img/buttons-faved.svg")
			.attr("width", "200px")
			.attr("height", "0px")
			.attr("x", "1px")
			.attr("y", "65px")
			.attr("class", "buttonsOverlayFaved")
			.attr("preserveAspectRatio", "xMidYMin slice")
			.attr("pointer-events", "none");



		var nodeUpdate = node.transition()
			.duration(duration)
			.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });


		nodeUpdate.selectAll('.queueIndicator')
			.style('opacity', function(d) {
				return vine.player.isQueued(d) ? 1 : 0;
			})

		nodeUpdate.select('text.queueIndicator')
			.text(function(d) {
				return vine.player.getQueuePosition(d) + 1;
			});

		nodeUpdate.select('image.buttonsOverlay')
			.style('opacity', function(d) {
				return d.favorited ? 0 : 1;
			});

		nodeUpdate.select('image.buttonsOverlayFaved')
			.style('opacity', function(d) {
				return d.favorited ? 1 : 0;
			});

		nodeUpdate.select("rect")
			.style("stroke", function(d) {
				if (vine.player.isPlaying(d)) {
					return "green";
				}
				else if (vine.player.isQueued(d)) {
					return "purple";
				}
				else if (vine.player.isAutoQueued(d)) {
					return "purple";
				}
				else if (vine.player.wasPlayed(d)) {
					return "blue";
				}
				else {
					return "black";
				}
			})
			.style("fill", function(d) {
				if (vine.player.isPlaying(d)) {
					return "#B7F7B7";
				}
				else if (vine.player.isQueued(d)) {
					return "#D9ABD9";
				}
				else if (vine.player.isAutoQueued(d)) {
					return "#f2e4f5";
				}
				else if (vine.player.wasPlayed(d)) {
					return "#A8A8FF";
				}
				else {
					return "white";
				}
			});

		nodeUpdate.filter(function(d) { return d.expanded == 1; }).selectAll("g.nodeControls").selectAll("rect")
			.style("fill", function(d) {
				if (vine.player.isPlaying(d)) {
					return "green";
				}
				else if (vine.player.isQueued(d)) {
					return "purple";
				}
				else if (vine.player.wasPlayed(d)) {
					return "blue";
				}
				else {
					return "#CCCCCC";
				}
			});

		if (z == 0) {

			nodeUpdate.select("g.node")
				.style("opacity", 1.0);

			nodeUpdate.select("rect")
				.attr("height", function(d) { return d.expanded == 1 ? nodeHeightExp : nodeHeight; })
				.attr("width", nodeWidth)
				.style("opacity", 1.0);

			nodeUpdate.select("rect.nodeBG")
				.attr("x", "0px")
				.attr("y", "0px");

			nodeUpdate.select("image.albumArt")
				.style("opacity", 1.0);

			nodeUpdate.select("text.name")
				.style("opacity", 1.0)
				.delay(50);

			nodeUpdate.select("text.artist")
				.style("opacity", 1.0)
				.delay(50);

			nodeUpdate.select("text.zoomName")
				.style("opacity", 0.0);

			nodeUpdate.filter(function(d) { return d.expanded == 1; }).selectAll("g.nodeControls").selectAll("rect")
				.attr("height", "24px")
				.delay(duration)
				.duration(0);

			nodeUpdate.filter(function(d) { return d.expanded == 1; }).selectAll("g.nodeControls").select("image")
				.attr("height", "24px")
				.attr("width", "200px");

			nodeUpdate.filter(function(d) { return d.expanded == 0; }).selectAll("g.nodeControls").selectAll("rect")
				.attr("height", "0px");

			//nodeUpdate.filter(function(d) { return d.expanded == 0; }).selectAll("g.nodeControls").select("image")
			//	.attr("height", "0px");

			nodeUpdate.each(function(d) {
				var h = d.expanded ? nodeHeight + 24 : nodeHeight - 2;
				vis.select('#clip-' + d.id).select('rect').transition()
					.duration(duration)
					.attr('height', h);
			});

			nodeUpdate.select('rect.queueIndicator')
				.attr('x', nodeWidth - 18 - 1)
				.attr('y', -1)

			nodeUpdate.select('text.queueIndicator')
				.attr('x', nodeWidth - 9)
				.attr('y', 12)

			nodeUpdate.select('image.loader')
				.attr('x', nodeWidth + 8)

		} else {

			nodeUpdate.filter(function(d) {
				return !(vine.player.wasPlayed(d) || vine.player.isPlaying(d) || vine.player.isQueued(d) || vine.player.isAutoQueued(d));
			}).select("rect.nodeBG")
				.style("opacity", 0.2);

			nodeUpdate.filter(function(d) {
				return !(vine.player.wasPlayed(d) || vine.player.isPlaying(d) || vine.player.isQueued(d) || vine.player.isAutoQueued(d));
			}).select("image.albumArt")
				.style("opacity", 0.2);

			nodeUpdate.select("rect")
				.attr("width", nodeWidthZoom)
				.attr("height", nodeHeightZoom);

			nodeUpdate.select("text.name")
				.style("opacity", 0.0)
				.duration(100);

			nodeUpdate.select("text.artist")
				.style("opacity", 0.0)
				.duration(100);

			nodeUpdate.filter(function(d) {
				return (vine.player.wasPlayed(d) || vine.player.isPlaying(d) || vine.player.isQueued(d) || vine.player.isAutoQueued(d));
			}).select("text.zoomName")
				.style("opacity", 1.0);

			nodeUpdate.filter(function(d) { return d.expanded == 1; }).selectAll("g.nodeControls").selectAll("rect")
				.attr("height", "0px")
				.duration(0);

			nodeUpdate.filter(function(d) { return d.expanded == 1; }).selectAll("g.nodeControls").selectAll("image")
				.attr("height", "0px")
				.attr("width", "66px");

			nodeUpdate.each(function(d) {
				var h = nodeHeight - 2;
				vis.select('#clip-' + d.id).select('rect').transition()
					.duration(duration)
					.attr('height', h);
			});

			nodeUpdate.select("rect.nodeBG")
				.attr("x", "6px")
				.attr("y", "6px");

			nodeUpdate.select('rect.queueIndicator')
				.attr('x', nodeWidthZoom - 18 - 1 + 6)
				.attr('y', -1 + 6)

			nodeUpdate.select('text.queueIndicator')
				.attr('x', nodeWidthZoom - 9 + 6)
				.attr('y', 12 + 6)

			nodeUpdate.select('image.loader')
				.attr('x', nodeWidthZoom + 16)
		}

		nodeUpdate.filter(function(d) { return d._expanding && !d._hasLoadingSpinner })
			.each(function(d) { d._hasLoadingSpinner = true; })
			.select('image.loader')
				.style('display', 'inline');

		var finished = nodeUpdate.filter(function(d) { return d._hasLoadingSpinner && !d._expanding })
		finished.select('image.loader')
			.style('display', 'none');

		finished.each(function(d) {
			setTimeout(function() { d._hasLoadingSpinner = false; }, 1);
		});
				//.style('display', 'none');

		nodeUpdate.filter(function(d) { return d._expanded && d.children.length == 0 })
			.select('image.loader')
				.style('display', 'inline')
				.attr('xlink:href', '/img/no-results.png');
				


		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
			.remove();

		nodeExit.select("rect")
			.attr("width", 0)
			.attr("height", 0);

		nodeExit.select("text").style("opacity", 0.0);


		var link = vis.selectAll("path.link")
			.data(tree.links(nodes), function(d) { return d.target.id; });

		link.enter().insert("svg:path", "g")
			.attr("class", "link")
			.attr("d", function(d) {
				var o = { x: source.x0, y: source.y0 };
				var a = diagonal({ source: o, target: o });
				return a;
			})
			.transition()
			.duration(duration)
			.attr("d", diagonal);

		var linkUpdate = link.transition()
			.duration(duration)
			.attr("d", function(d) {
				var s;
				if (z == 0) {
					s = { x: d.source.lX, y: d.source.lStartYm };
				} else {
					s = { x: d.source.lX, y: d.source.lStartYz };
				}
				var t = { x: d.target.lX, y: d.target.y };
				var a = diagonal({ source: s, target: t });
				return a;
			});

		if (z == 0) {
			linkUpdate.style("opacity", 1.0);
		}
		else {
			linkUpdate.filter(function(d) {
				return !(vine.player.wasPlayed(d.target) || vine.player.isPlaying(d.target) || vine.player.isQueued(d.target) || vine.player.isAutoQueued(d.target));
			})
			.style("opacity", 0.2);
		}

		link.exit().transition()
			.duration(duration)
			.attr("d", function(d) {
				var o = { x: source.x, y: source.y };
				return diagonal({ source: o, target: o });
			})
			.remove();

		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});

	};

	function pan() {
		if (d3.event.translate[0] > 300 || d3.event.translate[0] < -maxX) {
			currentPan[1] = d3.event.translate[1];
			zoom.translate(currentPan);
		} else {
			currentPan = d3.event.translate;
		}
		vis.attr("transform", "translate(" + (currentPan[0] + panBase[0]) + ", " + (currentPan[1] + panBase[1]) + ")");
//		console.log(d3.event.translate);
		update(vine.rootnode);
	}

	window.checkOverlap = function(node) {
		o = calcOverlap(node);
		scale(o);
	};

	function calcOverlap(node) {
		var maxOverlap = 0;
		var c = node.children;

		for (var i = 0; i < (c.length - 1) ; i++) {
			maxOverlap = Math.max(maxOverlap, 100 - (c[i + 1].x - c[i].x));
		}

		for (var i = 0; i < c.length; i++) {
			maxOverlap = Math.max(maxOverlap, calcOverlap(c[i]));
		}

		return maxOverlap;
	}

	function scale(overlap) {
		var old = height * heightMod;
		heightMod *= 100 / (100 - overlap);
		tree = d3.layout.tree().size([height * heightMod, width]);
		panBase[1] -= ((height * heightMod) - old) / 2;
		vis.transition()
			.duration(250)
			.attr("transform", "translate(" + (currentPan[0] + panBase[0]) + ", " + (currentPan[1] + panBase[1]) + ")");

		update(vine.rootnode);
	}

	window.resetView = function() {
		z = 0;
		heightMod = 1;
		currentPan = [0, 0];
		panBase[1] = -60;
		zoom.translate(currentPan);
		
		scale(0);
	}

	function updateLegend() {
		legend.transition()
			.duration(250)
			.attr('transform', 'translate(' + (z ? -200 : 0) + ', 100)');
	}

	function changeLevel(e) {
		var oldZ = z;
		if (d3.event.wheelDelta < 0) {
			z = 1;
			if (oldZ == 0 && currentPan[0] <= 0) {
				currentPan[0] *= .17276;
			}
		}
		else {
			z = 0;
			if (oldZ == 1 && currentPan[0] <= 0) {
				currentPan[0] /= .17276;
			}
		}
		
		if (z !== oldZ) {
			d3.event.translate = currentPan;
			vis.transition()
				.attr("transform", "translate(" + (currentPan[0] + panBase[0]) + ", " + (currentPan[1] + panBase[1]) + ")")
				.duration(250);
			
			updateLegend();
			update(vine.rootnode);
		}
	}


	function nodeClick(d) {
		//d.expand(updateNode);
		//console.log('node click')
	}

	function nodeOver(d) {
		if (!z) {
			if (currentHover != null) {
				currentHover.expanded = 0;
			}
			d.expanded = 1;
			currentHover = d;
			update(vine.rootnode);
		}
	}

	function move(x, y) {
		var a = [x, y];
		vis.attr("transform", "translate(" + a + ")");
		update(vine.rootnode);
	}




	function playClick(d) {
		//d3.event.stopPropagation();
		vine.player.playNow(d);
	}

	function playDown(d) {
		d3.event.stopPropagation();
		$(this).css("opacity", 1.0);
	}

	function playUp(d) {
		$(this).css("opacity", 0.5);
	}

	function playOver(d, a, b, c) {
		$(this).css("opacity", 0.5);
	}

	function playOut(d) {
		//console.log("off play");
		$(this).css("opacity", 0.0);
	}



	function queueClick(d) {
		//d3.event.stopPropagation();
		if (vine.player.isQueued(d)) {
			vine.player.dequeue(d);
		} else {
			vine.player.enqueue(d);
		}
	}

	function queueDown(d) {
		d3.event.stopPropagation();
		$(this).css("opacity", 1.0);
	}

	function queueUp(d) {
		$(this).css("opacity", 0.5);
	}

	function queueOver(d) {
		$(this).css("opacity", 0.5);
	}

	function queueOut(d) {
		$(this).css("opacity", 0.0);
	}




	function favClick(d) {
		if (d.favorited) {
			d.favorited = false;
		}
		else {
			d.favorited = true;
		}

		if (vine.player.isPlaying(d)) {
			vine.player.updateSongInfo();
		}

		update(vine.rootnode)
	}

	function favDown(d) {
		d3.event.stopPropagation();
		$(this).css("opacity", 1.0);
	}

	function favUp(d) {
		$(this).css("opacity", 0.5);
	}

	function favOver(d) {
		$(this).css("opacity", 0.5);
	}

	function favOut(d) {
		$(this).css("opacity", 0.0);
	}




	function infoClick(d) {
		//d3.event.stopPropagation();
		//console.log("clicked info");
		var url = d.song.url || d.song.albumUrl || d.song.artistUrl;
		if (url) {
			window.open(url);
		}
	}

	function infoDown(d) {
		d3.event.stopPropagation();
		$(this).css("opacity", 1.0);
	}

	function infoUp(d) {
		$(this).css("opacity", 0.5);
	}

	function infoOver(d) {
		$(this).css("opacity", 0.5);
	}

	function infoOut(d) {
		$(this).css("opacity", 0.0);
	}



	function toggle(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
	}

});