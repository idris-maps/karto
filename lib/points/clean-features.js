module.exports = function(feats) {
	var r = []
	for(i=0;i<feats.length;i++) {
		if(feats[i].geometry.type === 'Point') {
			r.push(feats[i])
		} else if(feats[i].geometry.type === 'MultiPoint' ) {
			var c = feats[i].geometry.coordinates
			var prop = feats[i].properties
			for(j=0;j<c.length;j++) {
				r.push({
					type: 'Feature',
					properties: props,
					geometry: {
						type: 'Point',
						coordinates: c[j]
					}
				})
			}
		}
	}
	return r
}
