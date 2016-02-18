module.exports = function(id, feats, style, path, svgId) {
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
