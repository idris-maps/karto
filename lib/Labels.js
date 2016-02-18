var cleanFeatures = require('./points/clean-features')
var appendLayer = require('./points/append-layer').labels
var setDefaultStyle = require('./points/set-default-style')

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


