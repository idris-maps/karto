module.exports = function(style) {
	var s = {
		'font-family': 'sans-serif',
		'font-size': '10px',
		'text-anchor': 'middle'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}
