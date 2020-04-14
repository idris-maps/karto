var s = require('d3-scale')

module.exports = function(o) {
	var opts = o.scaleOptions
	var type = o.type
	var domain = o.domain
	var range = o.range
	if(type === 'threshold') { var scale = s.scaleThreshold() }
	else { var scale = s.scaleLinear() }
	return scale.domain(domain).range(range)
}
