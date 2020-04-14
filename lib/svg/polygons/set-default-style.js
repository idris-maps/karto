module.exports = function(style) {
	var s = {
		'fill': 'black',
		'stroke': 'none'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}
