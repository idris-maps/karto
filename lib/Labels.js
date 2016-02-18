var cleanFeatures = require('./points/clean-features')
var styleString = require('./utils').styleString
var appendLayer = require('./points/append-layers').labels

module.exports = function(layerId, feats, prop, style, transform, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.prop = prop
	self.style = setDefaultStyle(style)
	self.transform = transform
	appendLayer(self.id, self.features, self.prop, self.style, self.transform, map.proj.projection, map.id)
	return this
}


