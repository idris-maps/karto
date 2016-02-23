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

exports.getJSON = function(url, callback) {
	var request = new XMLHttpRequest()
	request.open('GET', url, true)
	request.onload = function() {
		if(request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText)
			callback(null, data)
		} else {
			callback('ERROR: ' + url + ' Connected to server but it returned an error.', null)
		}
	}
	request.onerror = function() {
		callback('ERROR: ' + url + ' Could not connect to server', null)
	}
	request.send()
}
