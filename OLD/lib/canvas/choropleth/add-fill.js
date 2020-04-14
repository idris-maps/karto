module.exports = function(o) {
	var scale = o.scale
	var prop = o.prop
	for(i=0;i<o.features.length;i++) {
		var v = o.features[i].properties[prop]
		if(v !== null && v !== undefined) {
			o.features[i].properties.fill = scale(v)
		}
	}
}
