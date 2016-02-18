exports.markers = function(id, feats, url, style, projection, svgId) {
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

exports.labels = function(id, feats, prop, style, transform, proj, svgId) {
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
