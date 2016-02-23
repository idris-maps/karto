var tilebelt = require('tilebelt')

module.exports = function(tile, p) {
	var bb = tilebelt.tileToBBOX(tile)
	var topLeft = p([bb[0],bb[3]])
	var bottomRight = p([bb[2], bb[1]])
	return {
		x: topLeft[0],
		y: topLeft[1],
		width: bottomRight[0] - topLeft[0],
		height: bottomRight[1] - topLeft[1]
	}
}
