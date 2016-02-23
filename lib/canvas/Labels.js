var cleanFeatures = require('./points/clean-features')
var setDefaultStyle = require('./points/set-default-style').labels

module.exports = function(col, prop, style, transform, map) {
	var self = this
	self.features = cleanFeatures(col.features)
	self.style = setDefaultStyle(style)
	self.layer = 1
	self.prop = prop
	self.transform = transform
	self.draw = function(map) {
		self.features.forEach(function(f) {
			drawLabel(f, self, map)
		})
	}

	return this
}

function drawLabel(f, labels, map) {
	var p = map.proj.projection
	var txt = f.properties[labels.prop]
	var style = labels.style
	var tr = labels.transform
	var ctx = map.ctx

	ctx.beginPath()

	if(style.opacity === undefined) {
		ctx.globalAlpha = 1
	} else {
		ctx.globalAlpha = style.opacity
	}

	var c = f.geometry.coordinates
	if(c[0] < -179.99) { c[0] = -179.99 }
	else if(c[0] > 179.99) { c[0] = 179.99 }
	if(c[1] < -85) { c[1] = -85 }
	else if(c[1] > 85) { c[1] = 85 }
	var pc = p(c)

	if(tr !== undefined) {
		var x = tr[0]
		var y = tr[1]
		if(isNaN(x) === false) { pc[0] = pc[0] + x }
		if(isNaN(y) === false) { pc[1] = pc[1] + y }
	}
	
	ctx.font = getFont(style)
	ctx.textAlign = getTextAlign(style) 

	if(style.fill !== undefined && style.fill !== 'none') { 
		ctx.fillStyle = style.fill
		ctx.fillText(txt,pc[0],pc[1])
	}

	if(style.stroke !== undefined && style.stroke !== 'none') { 
		ctx.strokeStyle = style.stroke
		if(style['stroke-width'] === undefined) { ctx.lineWidth = 1 } else { ctx.lineWidth = style['stroke-width'] }
		ctx.strokeText(txt,pc[0],pc[1])
	}
}

function getFont(style) {
	return style['font-size'] + ' ' + style['font-family']
}

function getTextAlign(style) {
	if(style['text-anchor'] === 'middle') { return 'center' }
	else { return style['text-anchor'] }
}
