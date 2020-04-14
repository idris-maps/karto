var tilebelt = require('tilebelt')

module.exports = function(left, right, z) {
	var leftFrac = tilebelt.pointToTileFraction(left[0], left[1], z)
	var rightFrac = tilebelt.pointToTileFraction(right[0], right[1], z)
	var pixels = (rightFrac[0] - leftFrac[0]) * 256
	return pixels
}

