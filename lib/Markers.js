var cleanFeatures = require('./markers/clean-features')

module.exports = function(layerId, feats, url, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.url = url
	self.style = style
	appendLayer(self.id, self.features, self.url, self.style, map.proj.projection, map.id)
	return this
}

function appendLayer(id, feats, url, style, projection, svgId) {
	var g = document.createElementNS('http://www.w3.org/2000/svg','g')
	g.id = 'layer-' + id

	var str = ''
	for(i=0;i<feats.length;i++) {
		var screenCoords = projection(feats[i].geometry.coordinates)
		var x = screenCoords[0]
		var y = screenCoords[1]

		var width = '20px'
		var height = '20px'
		if(style !== undefined) {
			if(style.width !== undefined) { width = style.width }
			if(style.height !== undefined) { height = style.height }		
		}

		var transX = +width.split('px')[0] / 2
		var transY = +height.split('px')[0] / 2
		if(style !== undefined) { 
			if(style.iconAnchor !== undefined) { 
				transX = style.iconAnchor[0]
				transY = style.iconAnchor[1] 
			}
		}
		var transform = 'translate(' + -transX + ' ' + -transY + ')'
		str = str + '<image '
			+ 'id="layer-' + id + '-' + i + '" '
			+ 'xlink:href="' + url + '" '
			+ 'x="' + x + '" '
			+ 'y="' + y + '" '
			+ 'width="' + width + '" '
			+ 'height="' + height + '" '
			+ 'transform="' + transform + '" '
		+ '></image>'
	}
	g.innerHTML = str
	var svg = document.getElementById(svgId)
	svg.appendChild(g)
}
