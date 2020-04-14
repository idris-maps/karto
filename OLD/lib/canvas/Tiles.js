var parseUrl = require('./tiles/parse-url')
var checkOptions = require('./tiles/check-options')
var getZoomLevel = require('./tiles/get-zoom-level')
var findTiles = require('./tiles/find-tiles')
var getTilesInfo = require('./tiles/get-tiles-info')
var loadImgs = require('./tiles/load-imgs')

module.exports = function(url, options, opacity, zoomLevel, map) {
	var self = this
	if(url === undefined) { url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' }
	self.url = url
	self.parsedUrl = parseUrl(self.url)
	self.options = checkOptions(options, self.parsedUrl)
	if(zoomLevel === undefined) { zoomLevel = getZoomLevel(self, map) }
	self.z = zoomLevel
	if(opacity === undefined) { opacity = 1 }
	self.opacity = opacity
	self.tiles = findTiles(self, map)
	self.tilesInfo = getTilesInfo(self, map)
	self.loadImgs = loadImgs(self, map)
	
	self.draw = function() { 
		var ctx = map.ctx
		var tiles = self.tilesInfo
		tiles.forEach(function(t) {
			ctx.beginPath()

			if(self.opacity === undefined) {
				ctx.globalAlpha = 1
			} else {
				ctx.globalAlpha = self.opacity
			}

			ctx.drawImage(t.img, t.x, t.y, t.width, t.height)
		})
	}

	return this
}


























