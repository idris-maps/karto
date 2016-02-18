exports.styleString = function(o) {
	var str = ''
	for(k in o) {
		str = str + k + ':' + o[k] + ';'
	}
	return str
}

exports.rmElById = function(elId) {
	var el = document.getElementById(elId)
	el.parentNode.removeChild(el)
}
