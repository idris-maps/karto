var Svg = require('./lib/svg/index')
var Canvas = require('./lib/canvas/index')
var bbox = require('idris-geojson-bbox')

exports.svg = function(divId, w, h, bbox) {
	var m = new Svg(divId, w, h, bbox)
	return m
}

exports.canvas = function(divId, w, h, bbox) {
	var m = new Canvas(divId, w, h, bbox)
	return m
}

exports.getCollectionBbox = function(col, callback) {
	bbox(col, function(bb) {
		callback(bb)
	})
}
