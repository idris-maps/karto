var styleString = require('./utils').styleString
var cleanFeatures = require('./polygons/clean-features')

module.exports = function(layerId, feats, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.style = setDefaultStyle(style)
	appendLayer(self.id, self.features, self.style, map.proj.path, map.id)
	return this
}

function appendLayer(id, feats, style, path, svgId) {
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

function setDefaultStyle(style) {
	var s = {
		'fill': 'black',
		'stroke': 'none'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}
