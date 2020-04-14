module.exports = function(options, parsedUrl) {
	var o = {
		'subdomains': 'abc'
	}
	for(k in options) {
		o[k] = options[k]
	}
	var errs = []

	parsedUrl.forEach(function(part) {
		if(part.type === 'var') {
			if(part.key === 's') { part.val = o.subdomains }
			else if(part.key !== 'x' && part.key !== 'y' && part.key !== 'z') {
				if(o[part.key] === undefined) { errs.push(part.key) }
				else { part.val = o[part.key] } 
			}
		}
	})

	if(errs.length === 0) { return parsedUrl }
	else {
		console.log('ERROR: some attributes are missing to parse Tiles URL:')
		errs.forEach(function(err) { console.log(' * ' + err) })
		return null
	}
}
