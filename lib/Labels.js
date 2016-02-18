var cleanFeatures = require('./markers/clean-features')
var styleString = require('./utils').styleString

module.exports = function(layerId, feats, prop, style, transform, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.prop = prop
	self.style = setDefaultStyle(style)
	self.transform = transform
	appendLayer(self.id, self.features, self.prop, self.style, self.transform, map.proj.projection, map.id)
	return this
}

function appendLayer(id, feats, prop, style, transform, proj, svgId) {
	if(transform !== undefined) { t = 'transform="' + transform + '" ' } else { t='' }
	var g = document.createElementNS('http://www.w3.org/2000/svg','g')
	g.id = 'layer-' + id
	var str = ''
	for(i=0;i<feats.length;i++) {
		var text = feats[i].properties[prop]
		if(text !== undefined) {
			var screenCoords = proj(feats[i].geometry.coordinates)
			var x = screenCoords[0]
			var y = screenCoords[1]
			str = str + '<text id="layer-' + id + '-' + i +'" '
				+ 'x="' + x + '" '
				+ 'y="' + y + '" '
				+ 'style="' + styleString(style) + '" '
				+ t
				+ '>'
					+ text
				+ '</text>'
		}
	}
	g.innerHTML = str
	var svg = document.getElementById(svgId)
	svg.appendChild(g)
}

function setDefaultStyle(style) {
	var s = {
		'font-family': 'sans-serif',
		'font-size': '10px',
		'text-anchor': 'middle'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}
