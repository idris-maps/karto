var cleanFeatures = require('./polygons/clean-features')
var setDefaultStyle = require('./polygons/set-default-style')
var getScale = require('./choropleth/get-scale')
var getDomain = require('./choropleth/get-domain')
var addFill = require('./choropleth/add-fill')

module.exports = function(feats, opts, style, map) {
	if(opts === undefined) { console.log('Scale options are undefined') }
	else if(opts.type === undefined) { console.log('Type is undefined') }
	else if(Array.isArray(opts.range) === false || opts.range.length < 2) { console.log('Range is not an array') }
	else if(opts.range === undefined) { console.log('Range is undefined') }
	else if(opts.prop === undefined) { console.log('Prop is undefined') }
	else {
		var self = this
		self.features = cleanFeatures(feats)
		self.style = setDefaultStyle(style)
		self.layer = 1
		self.prop = opts.prop
		self.type = opts.type
		self.range = opts.range
		self.domain = getDomain(self)
		self.scale = getScale(self)
		addFill(self)
		self.draw = function(map) {
			self.features.forEach(function(f) {
				drawPolygon(f, self.style, f.properties.fill, map)
			})
		}
		return this
	}
}

function drawPolygon(f, style, fill, map) {
	var p = map.proj.projection
	var ctx = map.ctx
	ctx.beginPath()

	if(style.opacity === undefined) {
		ctx.globalAlpha = 1
	} else {
		ctx.globalAlpha = style.opacity
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

	ctx.fillStyle = fill
	ctx.fill()

	if(style.stroke !== undefined && style.stroke !== 'none') {
		ctx.strokeStyle = style.stroke
		ctx.lineWidth = style['line-width']
		ctx.lineJoin = style['line-join']
		ctx.lineCap = style['line-cap']
		ctx.stroke()
	}

}
