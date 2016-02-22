var cleanFeatures = require('./polygons/clean-features')
var setDefaultStyle = require('./polygons/set-default-style')

module.exports = function(col, style, map) {
	var self = this
	self.features = cleanFeatures(col.features)
	self.style = setDefaultStyle(style)
	self.layer = 1

	self.draw = function(map) {
		self.features.forEach(function(f) {
			drawPolygon(f, self.style, map)
		})
	}

	return this
}

function drawPolygon(f, style, map) {
	var p = map.proj.projection
	var ctx = map.ctx
	ctx.beginPath()

	if(this.opacity === undefined) {
		ctx.globalAlpha = 1
	} else {
		ctx.globalAlpha = this.opacity
	}

	for(k=0;k<f.geometry.coordinates.length;k++) {
		var part = f.geometry.coordinates[k]
		part.forEach(function(c, i) {

			if(c[0] < -179.99) { c[0] = -179.99 }
			else if(c[0] > 179.99) { c[0] = 179.99 }
			if(c[1] < -85) { c[1] = -85 }
			else if(c[1] > 85) { c[1] = 85 }

			var pc = p(c)
			if(i === 0) { ctx.moveTo(pc[0], pc[1]) }
			else { ctx.lineTo(pc[0], pc[1]) }
		})
	}
	ctx.closePath()

	if(style.fill !== undefined && style.fill !== 'none') {
		ctx.fillStyle = style.fill
		ctx.fill()
	}

	if(style.stroke !== undefined && style.stroke !== 'none') {
		ctx.strokeStyle = style.stroke
		ctx.lineWidth = style['line-width']
		ctx.lineJoin = style['line-join']
		ctx.lineCap = style['line-cap']
		ctx.stroke()
	}

}
