module.exports = function(urlModel, t) {
	var url = ''
	urlModel.forEach(function(u) {
		if(u.type === 'string') { url = url + u.val }
		else if(u.type === 'var') {
			if(u.key === 'x') { url = url + t[0] }
			else if(u.key === 'y') { url = url + t[1] }
			else if(u.key === 'z') { url = url + t[2] }
			else if(u.key === 's') { url = url + u.val[Math.floor(Math.random() * u.val.length)] }
			else { url = url + u.val }
		}
	})
	return url
}
