var cleanFeatures = require('./lines/clean-features')
var addLabels = require('./lines/add-labels')
var styleString = require('./utils').styleString

module.exports = function(layerId, feats, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.style = setDefaultStyle(style)
	self.labels = undefined
	self.addLabels = function(prop, style, uppercase) {
		self.labels = addLabels(prop, style, uppercase, self.features, self.id, map)
	}
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
		'fill': 'none',
		'stroke': 'black',
		'stroke-width': 1,
		'stroke-linejoin': 'round',
		'stroke-linecap': 'round'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}


