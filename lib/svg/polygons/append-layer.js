var styleString = require('../utils').styleString

module.exports = function(polygons, map) {
	var id = polygons.id
	var feats = polygons.features
	var style = polygons.style
	var path = map.proj.path
	var svgId = map.id
	var g = document.createElementNS('http://www.w3.org/2000/svg','g')
	g.id = 'layer-' + id
	var str = ''
	for(i=0;i<feats.length;i++) {
		str = str + '<path id="layer-' + id + '-' + i +'" d="' + path(feats[i]) + '" style="' + styleString(style) + '"></path>'
	}
	g.innerHTML = str
	var svg = document.getElementById(svgId)
	svg.appendChild(g)
}
