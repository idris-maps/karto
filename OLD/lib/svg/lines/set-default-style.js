module.exports = function(style) {
	var s = {
		'fill': 'none',
		'stroke': 'black',
		'stroke-width': 1,
		'stroke-linejoin': 'round',
		'stroke-linecap': 'round'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}
