
features = 
	modernizr:
		required:
			cors: 'Cross-origin Resource Sharing'
			svg: 'Scalable Vector Graphics'
			inlinesvg: 'Inline Scalable Vector Graphics'
			history: 'HTML5 history API'
			localstorage: 'Web Storage'

		optional:
			mediaqueries: 'CSS media queries'
			cssanimations: 'CSS animations'
			csstransitions: 'CSS transitions'
			boxsizing: 'CSS box-sizing property'
	
	window:
		required:
			FormData: 'FormData object'

	test: ->
		req = []
		opt = []
		for feat, desc of features.modernizr.required
			if not Modernizr[feat]
				req.push desc

		for feat, desc of features.window.required
			if not feat in window
				req.push desc
			
		for feat, desc of features.modernizr.optional
			if not Modernizr[feat]
				opt.push desc

		for feat, desc of features.window.optional
			if not feat in window
				opt.push desc

		return { required: req, optional: opt }

$ ->
	{ required, optional } = features.test()

	if required.length > 0
		$('#features').show()

		list = $('#missing-features')
		for feature in required
			list.append $('<li>').text feature
