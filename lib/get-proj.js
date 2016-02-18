var geo = require('d3-geo').geo

module.exports = function(canvas, bbox) {
	var collection = createCol(bbox)
	var projection = geo.mercator()
		  .scale(1)
		  .translate([0, 0])
	var path = geo.path()
		  .projection(projection)
	var b = path.bounds(collection)
	var s = .95 /Math.max((b[1][0] - b[0][0]) /canvas.width, (b[1][1] - b[0][1]) /canvas.height)
	var t = [(canvas.width - s * (b[1][0] + b[0][0])) /2, (canvas.height - s * (b[1][1] + b[0][1])) /2]
	projection
		  .scale(s)
		  .translate(t)

	return {path: path, projection: projection}
}

function createCol(bbox) {
	return {
		type: 'FeatureCollection',
		features: [
			{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [bbox[0], bbox[1]] } },
			{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [bbox[2], bbox[3]] } }
		]
	}
}
