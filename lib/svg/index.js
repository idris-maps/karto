var getProj = require('../get-proj')
var Lines = require('./Lines')
var Polygons = require('./Polygons')
var Markers = require('./Markers')
var Labels = require('./Labels')
var background = require('./background')

module.exports = function(divId, w, h, bbox) {
	var self = this
	self.id = Date.now()
	self.div = document.getElementById(divId)	
	self.size = {width: w, height: h}
	self.div.innerHTML = '<svg '
		+ 'width="' + self.size.width + '" '
		+ 'height="' + self.size.height + '" '
		+ 'id="' + self.id
		+'" ></svg>'
	self.bbox = bbox
	self.proj = getProj(self.size, self.bbox)
	self.layerId = 0
	self.newLayerId = function() { self.layerId = self.layerId + 1; return self.layerId }
	self.textPositions = []
	self.background = function(color) { background(color, self.id, self.size) }
	self.markers = function(col, url, style) {
		var x = new Markers(self.newLayerId(), col.features, url, style, self)
		return x
	}
	self.labels = function(col, prop, style, transform) {
		var x = new Labels(self.newLayerId(), col.features, prop, style, transform, self)
		return x
	}
	self.lines = function(col, style) {
		var x = new Lines(self.newLayerId(), col.features, style, self)
		return x
	}
	self.polygons = function(col, style) {
		var x = new Polygons(self.newLayerId(), col.features, style, self)
		return x
	}
}
