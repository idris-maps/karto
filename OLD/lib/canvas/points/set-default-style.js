exports.labels = function(style) {
	var s = {
		'opacity': 1,
		'fill': 'black',
		'stroke': 'none',
		'font-family': 'sans-serif',
		'font-size': '10px',
		'text-anchor': 'middle'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}

exports.markers = function(style) {
	var s = {
		'opacity': 1
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}
