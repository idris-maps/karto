module.exports = function(feats) {
	var r = []
	for(i=0;i<feats.length;i++) {
		if(feats[i].geometry.type === 'Polygon' || feats[i].geometry.type === 'MultiPolygon' ) {
			r.push(feats[i])
		}
	}
	return r
}
