module.exports = function(feats) {
	var r = []
	for(i=0;i<feats.length;i++) {
		if(feats[i].geometry.type === 'LineString' || feats[i].geometry.type === 'MultiLineString' ) {
			var f = ensureLeftToRight(feats[i])
			r.push(f)
		}
	}
	return r
}

function ensureLeftToRight(feat) {
	var t = feat.geometry.type
	if(t === 'LineString') {
		var c = feat.geometry.coordinates
		feat.geometry.coordinates = invertIfNeed(c)
	} else {
		var cs = feat.geometry.coordinates
		var newCs = []
		for(i=0;i<cs.length;i++) {
			newCs.push(invertIfNeed(cs[i]))
		}
		feat.geometry.coordinates = newCs
	}
	return feat
}

function invertIfNeed(arr) {
	var first = arr[0]
	var last = arr[arr.length - 1]
	var invert = false
	if(first[0] > last[0]) { arr.reverse() }
	return arr
}
