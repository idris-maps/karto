var cleanFeatures = require('./lines/clean-features')
var addLabels = require('./lines/add-labels')
var appendLayer = require('./lines/append-layer')
var setDefaultStyle = require('./lines/set-default-style')

module.exports = function(layerId, feats, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.style = setDefaultStyle(style)
	self.labels = undefined
	self.addLabels = function(prop, style, uppercase) {
		self.labels = addLabels(prop, style, uppercase, self, map)
	}
	appendLayer(self, map)
	return this
}


