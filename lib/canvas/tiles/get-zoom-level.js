var calcPixels = require('./calc-pixels')
var tilebelt = require('tilebelt')

module.exports = function(o, map) {
	var bbox = map.bbox
	var z = tilebelt.bboxToTile(bbox)[2]
	var left = [bbox[0], bbox[1]]
	var right = [bbox[2], bbox[1]]
	while(calcPixels(left, right, z) < map.size.width) {
		z++
	}
	return z
}
