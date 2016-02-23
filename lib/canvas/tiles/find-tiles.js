var tilebelt = require('tilebelt')

module.exports = function(o, map) {
	if(o.options === null) { return null }
	else {
		var bbox = map.bbox
		var topLeftTile = tilebelt.pointToTile(bbox[0], bbox[3], o.z)
		var bottomRightTile = tilebelt.pointToTile(bbox[2], bbox[1], o.z)
		var tiles = []
		for(x=topLeftTile[0];x<bottomRightTile[0] + 1;x++) {
			for(y=topLeftTile[1];y<bottomRightTile[1] + 1;y++) {
				tiles.push([x, y, o.z])
			}
		}
		return tiles
	}
}
