var styleString = require('../utils').styleString
var rmElById = require('../utils').rmElById

module.exports = function(prop, style, uppercase, feats, id, map) {
	appendGroup(map.id, id)
	style = setDefaultStyle(style)
	var fontSize = +style['font-size'].split('px')[0]
	for(i=0;i<feats.length;i++) {
		var p = feats[i].properties[prop]
		if(p !== undefined && p !== null && p !== '') {
			if(uppercase !== undefined && uppercase === true) { p = p.toUpperCase() }
			var elLength = getElLength(i, id)
			if(elLength > p.length * fontSize * 0.6) {
				appendText(i, id, p, style, function(bb) {
					if(checkIfOverlaps(map.textPositions, bb)) { rmElById('layer-' + id + '-' + i + '-label') }
					else { map.textPositions.push(bb) }
				})
			}
		}
	}
}

function getElLength(index, id) {
	var elId = 'layer-' + id + '-' + index
	var el = document.getElementById(elId)
	return el.getTotalLength()
}

function setDefaultStyle(style) {
	var s = {
		'alignment-baseline': 'mathematical',
		'font-family': 'sans-serif',
		'font-size': '10px'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}

function appendText(index, id, p, style, callback) {
	var g = document.getElementById('layer-' + id + '-labels')
	var xlinkHref = '#layer-' + id + '-' + index
	var text = document.createElementNS('http://www.w3.org/2000/svg','text')
	text.setAttribute('style', styleString(style))
	text.id = 'layer-' + id + '-' + index + '-label'
	text.innerHTML = '<textPath ' 
		+ 'xlink:href="' + xlinkHref + '" '
		+ 'startOffset="50%" '
		+ 'text-anchor="middle" '
		+ 'dominant-baseline="middle" '
		+ '>' + p + '</textPath>'
	g.appendChild(text)
	
	var bb = text.getBoundingClientRect()
	callback(bb)
}

function appendGroup(svgId, layerId) {
	var svg = document.getElementById(svgId)
	var g = document.createElementNS('http://www.w3.org/2000/svg','g')
	g.id = 'layer-' + layerId + '-labels'
	svg.appendChild(g)
}

function checkIfOverlaps(all, one) {
	var resp = false
	var x = []
	for(y=0;y<all.length;y++) {
		var overlap = !(one.right < all[y].left || 
			one.left > all[y].right || 
			one.bottom < all[y].top || 
			one.top > all[y].bottom)
		x.push(overlap)
	}
	for(z=0;z<x.length;z++) {
		if(x[z]) { resp = true; break }
	}
	return resp
}
