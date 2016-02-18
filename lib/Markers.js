var cleanFeatures = require('./points/clean-features')
var appendLayer = require('./points/append-layer').markers

module.exports = function(layerId, feats, url, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.url = url
	self.style = style
	appendLayer(self.id, self.features, self.url, self.style, map.proj.projection, map.id)
	return this
}


