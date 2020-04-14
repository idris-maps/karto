var tilebelt = require('tilebelt')

module.exports = function(tiles, p) {
	var bbox = tiles.bbox
	var z = tiles.options['zoom-level']
	var topLeft = tilebelt.pointToTile(bbox[2], bbox[1], z)
	var bottomRight = tilebelt.pointToTile(bbox[0], bbox[3], z)
	var tilesToGet = []
	for(x=bottomRight[0];x<topLeft[0] + 1;x++) {
		for(y=bottomRight[1];y<topLeft[1] + 1;y++) {
			tilesToGet.push([x, y, z])
		}
	}
	return getTileUrls(tiles, tilesToGet, p)
}
