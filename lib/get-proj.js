var geo = require('d3-geo').geo

module.exports = function(canvas, bbox) {
	if(bbox[0] < -179.99) { bbox[0] = -179.99 }
	if(bbox[1] < -85) { bbox[1] = -85 }
	if(bbox[2] > 179.99) { bbox[2] = 179.99 }
	if(bbox[3] > 85) { bbox[3] = 85 }
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
