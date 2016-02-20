var Svg = require('./lib/svg/index')

exports.svg = function(divId, w, h, bbox) {
	var m = new Svg(divId, w, h, bbox)
	return m
}
