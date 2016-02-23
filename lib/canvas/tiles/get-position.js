var tilebelt = require('tilebelt')

module.exports = function(t, p) {
	var bb = tilebelt.tileToBBOX(t)
	var min = p([bb[0], bb[3]])
	var max = p([bb[2], bb[1]])
	var r = {
		x: min[0],
		y: min[1],
		width: max[0] - min[0],
		height: max[1] - min[1]
	}
	return r
}
