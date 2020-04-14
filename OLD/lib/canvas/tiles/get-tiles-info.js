var getPosition = require('./get-position')
var getUrl = require('./get-url')

module.exports = function(o, map) {
	if(o.options === null) { return null }
	else {
		var tiles = o.tiles
		var urlModel = o.parsedUrl
		var r = []
		tiles.forEach(function(t) {
			var x = getPosition(t, map.proj.projection)
			x.url = getUrl(urlModel, t)
			r.push(x)
		})
		return r
	}
}
