root = this


queryify = (data) ->
	parts = []
	for key of data
		parts.push key + '=' + encodeURIComponent(data[key])

	return parts.join '&'

class root.GrooveShark
	@endpoint = '/cs465/api/query-song.php'

	key = null
	
	constructor: (apikey) ->
		key = apikey

	query: (query, callback) ->
		url = GrooveShark.endpoint + '?' + queryify(query)
		$.getJSON(url).then(
			(data) ->
				callback null, data
			, (err) ->
				callback err, null
		)

	# search(query [, limit = 1], callback)
	search: (query, limit, callback) =>
		single = false
		if not arguments[2]?
			callback = arguments[1]
			limit = 1
			single = true

		this.query { query: query, limit: limit }, (err, data) ->
			if err
				callback err, data
			else
				if single
					data = data?[0] ? null
				else if not data?
					data = []
				
				callback null, data