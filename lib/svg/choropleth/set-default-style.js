module.exports = function(style) {
	var s = {
		'stroke': 'none'
	}
	if(style !== undefined) {
		for(k in style) { if(k !== 'fill') { s[k] = style[k] } }
	}
	return s
}
