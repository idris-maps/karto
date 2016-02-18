var styleString = require('./utils').styleString
var cleanFeatures = require('./polygons/clean-features')
var setDefaultStyle = require('./polygons/set-default-style')
var appendLayer = require('./polygons/append-layer')

module.exports = function(layerId, feats, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.style = setDefaultStyle(style)
	appendLayer(self.id, self.features, self.style, map.proj.path, map.id)
	return this
}




