module.exports = function(style) {
	var s = {
		'opacity': 1,
		'fill': 'black',
		'stroke': 'none',
		'line-width': 1,
		'line-join': 'round',
		'line-cap': 'round'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}
