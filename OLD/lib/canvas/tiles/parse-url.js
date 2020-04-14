module.exports = function(url) {
	var parts1 = url.split('{')
	var parts = []
	parts1.forEach(function(part, i) {
		if(i === 0) { parts.push({type: 'string', val: part}) }
		else {
			var p = part.split('}')
			parts.push({type: 'var', key: p[0], val: undefined})
			parts.push({type: 'string', val: p[1]})
		}
	})
	return parts
}
