var styleString = require('../utils').styleString

module.exports = function(polygons, map) {
	var id = polygons.id
	var feats = polygons.features
	var style = rmFill(polygons.style)
	var path = map.proj.path
	var svgId = map.id
	var g = document.createElementNS('http://www.w3.org/2000/svg','g')
	g.id = 'layer-' + id
	var str = ''
	for(i=0;i<feats.length;i++) {
		if(feats[i].properties.fill === undefined) {
			var color = style.fill
		} else {
			var color = feats[i].properties.fill
		}
		str = str + '<path id="layer-' + id + '-' + i +'" '
			+ 'd="' + path(feats[i]) + '" '
			+ 'style="' + styleString(style.rest) + ';fill:' + color + '" '
			+ '></path>'
	}
	g.innerHTML = str
	var svg = document.getElementById(svgId)
	svg.appendChild(g)
}

function rmFill(o) {
	var r = {}
	var fill = null
	for(k in o) {
		if(k === 'fill') {
			fill = o[k]
		} else {
			r[k] = o[k]
		}
	}
	return {
		fill: fill,
		rest: r
	}
}


