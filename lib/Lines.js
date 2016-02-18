var cleanFeatures = require('./lines/clean-features')
var addLabels = require('./lines/add-labels')
var styleString = require('./utils').styleString
var appendLayer = require('./lines/append-layer')
var setDefaultStyle = require('./lines/set-default-style')

module.exports = function(layerId, feats, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.style = setDefaultStyle(style)
	self.labels = undefined
	self.addLabels = function(prop, style, uppercase) {
		self.labels = addLabels(prop, style, uppercase, self.features, self.id, map)
	}
	appendLayer(self.id, self.features, self.style, map.proj.path, map.id)
	return this
}


