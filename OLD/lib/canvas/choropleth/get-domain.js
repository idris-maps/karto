module.exports = function(o) {
	var prop = o.prop
	var feats = o.features
	var type = o.type
	var nbFeats = feats.length
	var nbRange = o.range.length
	var minVal = Infinity
	var maxVal = -Infinity
	var all = []
	for(i=0;i<nbFeats;i++) {
		var p = feats[i].properties[prop]
		if(p !== undefined && p != null) {
			if(p > maxVal) { maxVal = p }
			if(p < minVal) { minVal = p }
			all.push(p)
		}
	}
	if(all.length === 0) {
		console.log('No feature has the property "' + prop + '"')
		return null
	} else {
		all.sort()
		if(type === 'linear') {
			if(nbRange === 2) { return [minVal, maxVal] }
			else {
				var rg = []
				for(i=0;i<nbRange;i++) {
					rg.push(Math.round((nbFeats / (nbRange - 1)) * i) - 1)
				}
				var domain = [minVal]
				for(i=1;i<nbRange-1;i++) {
					domain.push(all[rg[i]])
				}
				domain.push(maxVal)
				return domain
			}
		}
		else if(type === 'threshold') {
			if(nbRange === 2) { return [all[Math.round(nbFeats/2)]] }
			else {
				var rg = []
				for(i=0;i<nbRange;i++) {
					rg.push(Math.round((nbFeats / nbRange) * i) - 1)
				}
				var domain = []
				for(i=1;i<nbRange;i++) {
					domain.push(all[rg[i]])
				}
				return domain
			} 
		}
	}
}
