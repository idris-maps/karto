module.exports = function(feats) {
	var r = []
	feats.forEach(function(f) {
		if(f.geometry.type === 'Polygon') { r.push(f) }
		else if(f.geometry.type === 'MultiPolygon') {
			var cs = f.geometry.coordinates
			var props = f.properties
			cs.forEach(function(c) {
				var part = {
					type: 'Feature',
					properties: props,
					geometry: {
						type: 'Polygon',
						coordinates: c
					}			
				}
				r.push(part)
			})
		}
	})

	return r
}
