(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var karto = require('./index')

window.karto = karto

},{"./index":2}],2:[function(require,module,exports){
var Svg = require('./lib/svg/index')
var Canvas = require('./lib/canvas/index')
var bbox = require('idris-geojson-bbox')

exports.svg = function(divId, w, h, bbox) {
	var m = new Svg(divId, w, h, bbox)
	return m
}

exports.canvas = function(divId, w, h, bbox) {
	var m = new Canvas(divId, w, h, bbox)
	return m
}

exports.getCollectionBbox = function(col, callback) {
	bbox(col, function(bb) {
		callback(bb)
	})
}

exports.getJSON = function(url, callback) {
	var request = new XMLHttpRequest()
	request.open('GET', url, true)
	request.onload = function() {
		if(request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText)
			callback(null, data)
		} else {
			callback('ERROR: ' + url + ' Connected to server but it returned an error.', null)
		}
	}
	request.onerror = function() {
		callback('ERROR: ' + url + ' Could not connect to server', null)
	}
	request.send()
}

},{"./lib/canvas/index":13,"./lib/svg/index":42,"idris-geojson-bbox":63}],3:[function(require,module,exports){
module.exports = function(color, map) {
	var self = this
	self.type = 'rect'
	self.width = map.size.width
	self.height = map.size.height
	self.fill = color
	self.layer = 0
	self.draw = function(map) {
		var ctx = map.ctx
		ctx.beginPath()
		ctx.rect(0,0,self.width,self.height)
		ctx.fillStyle = self.fill
		ctx.fill()
	}
	return this
}

},{}],4:[function(require,module,exports){
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

},{"./choropleth/add-fill":10,"./choropleth/get-domain":11,"./choropleth/get-scale":12,"./polygons/clean-features":19,"./polygons/set-default-style":20}],5:[function(require,module,exports){
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

},{"./points/clean-features":17,"./points/set-default-style":18}],6:[function(require,module,exports){
var cleanFeatures = require('./lines/clean-features')
var setDefaultStyle = require('./lines/set-default-style')

module.exports = function(col, style, map) {
	var self = this
	self.features = cleanFeatures(col.features)
	self.style = setDefaultStyle(style)
	self.layer = 1

	self.draw = function(map) {
		self.features.forEach(function(f) {
			drawLine(f, self.style, map)
		})
	}

	self.addLabels = function() {
		console.log('karto.canvas().lines() does not have .addLabels(), use karto.svg().lines() instead')
	}

	return this
}

function drawLine(f, style, map) {
	var p = map.proj.projection
	var ctx = map.ctx
	ctx.beginPath()

	if(style.opacity === undefined) {
		ctx.globalAlpha = 1
	} else {
		ctx.globalAlpha = style.opacity
	}

	var coords = f.geometry.coordinates
	coords.forEach(function(c, i) {

		if(c[0] < -179.99) { c[0] = -179.99 }
		else if(c[0] > 179.99) { c[0] = 179.99 }
		if(c[1] < -85) { c[1] = -85 }
		else if(c[1] > 85) { c[1] = 85 }

		var pc = p(c)
		if(i === 0) { ctx.moveTo(pc[0], pc[1]) }
		else { ctx.lineTo(pc[0], pc[1]) }
	})



	if(style.fill !== undefined && style.fill !== 'none') {
		ctx.fillStyle = style.fill
		ctx.fill()
	}

	if(style.stroke !== undefined && style.stroke !== 'none') {
		ctx.strokeStyle = style.stroke
		ctx.lineWidth = style['stroke-width']
		ctx.lineJoin = style['line-join']
		ctx.lineCap = style['line-cap']
		ctx.stroke()
	}

}

},{"./lines/clean-features":14,"./lines/set-default-style":15}],7:[function(require,module,exports){
var cleanFeatures = require('./points/clean-features')
var setDefaultStyle = require('./points/set-default-style').markers
var addImageFile = require('./points/add-image-file')

module.exports = function(col, url, style, map) {
	map.imagesLoading = map.imagesLoading + 1
	var self = this
	self.features = cleanFeatures(col.features)
	self.style = setDefaultStyle(style)
	self.layer = 1
	self.img = addImageFile(url, map)
	self.draw = function(map) {
		self.features.forEach(function(f) {
			drawMarker(f, self, map)
		})
	}
	return this
}

function drawMarker(f, markers, map) {
	var p = map.proj.projection
	var style = markers.style
	var img = markers.img
	var c = f.geometry.coordinates
	var ctx = map.ctx
	ctx.beginPath()

	if(this.opacity === undefined) {
		ctx.globalAlpha = 1
	} else {
		ctx.globalAlpha = style.opacity
	}

	if(style.width !== undefined && style.height !== undefined) {
		var w = style.width
		var h = style.height
	} else if(style.width !== undefined && style.height === undefined) {
		var w = style.width
		var h = w / img.naturalWidth * img.naturalHeight
	} else if(style.width === undefined && style.height !== undefined) {
		var h = style.height
		var w = h / img.naturalHeight * img.naturalWidth 
	} else {
		var w = img.naturalWidth
		var h = img.naturalHeight
	}

	var transX = w / 2
	var transY = h / 2
	if(style !== undefined) { 
		if(style.iconAnchor !== undefined) { 
			transX = style.iconAnchor[0]
			transY = style.iconAnchor[1] 
		}
	}

	var pc = p(c)
	pc[0] = pc[0] - transX
	pc[1] = pc[1] - transY
	ctx.drawImage(img,pc[0],pc[1],w,h)
}

},{"./points/add-image-file":16,"./points/clean-features":17,"./points/set-default-style":18}],8:[function(require,module,exports){
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

},{"./polygons/clean-features":19,"./polygons/set-default-style":20}],9:[function(require,module,exports){
var parseUrl = require('./tiles/parse-url')
var checkOptions = require('./tiles/check-options')
var getZoomLevel = require('./tiles/get-zoom-level')
var findTiles = require('./tiles/find-tiles')
var getTilesInfo = require('./tiles/get-tiles-info')
var loadImgs = require('./tiles/load-imgs')

module.exports = function(url, options, opacity, zoomLevel, map) {
	var self = this
	if(url === undefined) { url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' }
	self.url = url
	self.parsedUrl = parseUrl(self.url)
	self.options = checkOptions(options, self.parsedUrl)
	if(zoomLevel === undefined) { zoomLevel = getZoomLevel(self, map) }
	self.z = zoomLevel
	if(opacity === undefined) { opacity = 1 }
	self.opacity = opacity
	self.tiles = findTiles(self, map)
	self.tilesInfo = getTilesInfo(self, map)
	self.loadImgs = loadImgs(self, map)
	
	self.draw = function() { 
		var ctx = map.ctx
		var tiles = self.tilesInfo
		tiles.forEach(function(t) {
			ctx.beginPath()

			if(self.opacity === undefined) {
				ctx.globalAlpha = 1
			} else {
				ctx.globalAlpha = self.opacity
			}

			ctx.drawImage(t.img, t.x, t.y, t.width, t.height)
		})
	}

	return this
}



























},{"./tiles/check-options":22,"./tiles/find-tiles":23,"./tiles/get-tiles-info":25,"./tiles/get-zoom-level":27,"./tiles/load-imgs":28,"./tiles/parse-url":29}],10:[function(require,module,exports){
module.exports = function(o) {
	var scale = o.scale
	var prop = o.prop
	for(i=0;i<o.features.length;i++) {
		var v = o.features[i].properties[prop]
		if(v !== null && v !== undefined) {
			o.features[i].properties.fill = scale(v)
		}
	}
}

},{}],11:[function(require,module,exports){
module.exports = function(o) {
	var prop = o.prop
	var feats = o.features
	var type = o.type
	var nbFeats = feats.length
	var nbRange = o.range.length
	var minVal = Infinity
	var maxVal = -Infinity
	var all = []
	for(i=0;i<nbFeats;i++) {
		var p = feats[i].properties[prop]
		if(p !== undefined && p != null) {
			if(p > maxVal) { maxVal = p }
			if(p < minVal) { minVal = p }
			all.push(p)
		}
	}
	if(all.length === 0) {
		console.log('No feature has the property "' + prop + '"')
		return null
	} else {
		all.sort()
		if(type === 'linear') {
			if(nbRange === 2) { return [minVal, maxVal] }
			else {
				var rg = []
				for(i=0;i<nbRange;i++) {
					rg.push(Math.round((nbFeats / (nbRange - 1)) * i) - 1)
				}
				var domain = [minVal]
				for(i=1;i<nbRange-1;i++) {
					domain.push(all[rg[i]])
				}
				domain.push(maxVal)
				return domain
			}
		}
		else if(type === 'threshold') {
			if(nbRange === 2) { return [all[Math.round(nbFeats/2)]] }
			else {
				var rg = []
				for(i=0;i<nbRange;i++) {
					rg.push(Math.round((nbFeats / nbRange) * i) - 1)
				}
				var domain = []
				for(i=1;i<nbRange;i++) {
					domain.push(all[rg[i]])
				}
				return domain
			} 
		}
	}
}

},{}],12:[function(require,module,exports){
var s = require('d3-scale')

module.exports = function(o) {
	var opts = o.scaleOptions
	var type = o.type
	var domain = o.domain
	var range = o.range
	if(type === 'threshold') { var scale = s.scaleThreshold() }
	else { var scale = s.scaleLinear() }
	return scale.domain(domain).range(range)
}

},{"d3-scale":60}],13:[function(require,module,exports){
var getProj = require('../get-proj')
var saveAs = require('../file-saver')

var Background = require('./Background')
var Polygons = require('./Polygons')
var Choropleth = require('./Choropleth')
var Lines = require('./Lines')
var Labels = require('./Labels')
var Markers = require('./Markers')
var Tiles = require('./Tiles')

module.exports = function(divId, w, h, bbox) {
	var self = this
	self.id = Date.now()
	self.div = document.getElementById(divId)	
	self.size = {width: w, height: h}
	self.canvas = createCanvas(self.div, self.size)
	self.ctx = self.canvas.getContext('2d')
	self.objs = []
	self.imgs = []
	self.bbox = bbox
	self.proj = getProj(self.size, self.bbox)
	self.imagesLoading = 0
	self.imagesDoneLoading = function() {
		self.imagesLoading = self.imagesLoading - 1
	}
	self.background = function(color) { 
		var o = new Background(color, self) 
		self.objs.push(o)
		return o
	}
	self.tiles = function(url, options, opacity, zoomLevel) {
		var o = new Tiles(url, options, opacity, zoomLevel, self)
		self.objs.push(o)
		return o
	}
	self.polygons = function(col, style) {
		var o = new Polygons(col, style, self)
		self.objs.push(o)
		return o
	}
	self.choropleth = function(col, opts, style) {
		var o = new Choropleth(col.features, opts, style, self)
		self.objs.push(o)
		return o
	}
	self.lines = function(col, style) {
		var o = new Lines(col, style, self)
		self.objs.push(o)
		return o
	}
	self.labels = function(col, prop, style, transform) {
		var o = new Labels(col, prop, style, transform, self)
		self.objs.push(o)
		return o
	}
	self.markers = function(col, url, style) {
		var o = new Markers(col, url, style, self)
		self.objs.push(o)
		return o
	}
	self.draw = function() {
		checkIfLoading(self)
	}
	self.downloadButton = function() {
		var btn = document.createElement('button')
		btn.innerHTML = 'Download'
		btn.style.position = 'fixed'
		btn.style.top = '10px'
		btn.style.left = '10px'
		self.div.appendChild(btn)
		btn.onclick = function() {
			self.canvas.toBlob(function(blob) {
					saveAs(blob, 'map.png')
			})
		}
	}
}
function checkIfLoading(x) {
	if(x.imagesLoading === 0) {
		drawNow(x)
	} else {
		setTimeout(function() {
			console.log('waiting for ' + x.imagesLoading + ' images')
			checkIfLoading(x)
		},10)
	}
}

function drawNow(map) {
	var ctx = map.ctx
	var objs = map.objs.sort(function(a,b) { return a.layer - b.layer })
	ctx.clearRect(0,0,map.size.width,map.size.height)
	for(i=0;i<objs.length;i++) {
		var o = objs[i]
		o.draw(map)
	}
}

function createCanvas(div, size){
	var canvas = document.createElement('canvas')
	canvas.setAttribute('width', size.width)
	canvas.setAttribute('height', size.height)
	div.appendChild(canvas)
	return canvas
}

},{"../file-saver":30,"../get-proj":31,"./Background":3,"./Choropleth":4,"./Labels":5,"./Lines":6,"./Markers":7,"./Polygons":8,"./Tiles":9}],14:[function(require,module,exports){
module.exports = function(feats) {
	var r = []
	feats.forEach(function(f) {
		if(f.geometry.type === 'LineString') { r.push(f) }
		else if(f.geometry.type === 'MultiLineString') {
			var cs = f.geometry.coordinates
			var props = f.properties
			cs.forEach(function(c) {
				var part = {
					type: 'Feature',
					properties: props,
					geometry: {
						type: 'LineString',
						coordinates: c
					}			
				}
				r.push(part)
			})
		}
	})

	return r
}

},{}],15:[function(require,module,exports){
module.exports = function(style) {
	var s = {
		'opacity': 1,
		'fill': 'none',
		'stroke': 'black',
		'stroke-width': 1,
		'line-join': 'round',
		'line-cap': 'round'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}

},{}],16:[function(require,module,exports){
module.exports = function(file, x) {
	var img = new Image()
	img.addEventListener('load', function() {
		x.imagesDoneLoading()
	}, false)
	img.src = file
	return img
}

},{}],17:[function(require,module,exports){
module.exports = function(feats) {
	var r = []
	feats.forEach(function(f) {
		if(f.geometry.type === 'Point') { r.push(f) }
		else if(f.geometry.type === 'MultiPoint') {
			var cs = f.geometry.coordinates
			var props = f.properties
			cs.forEach(function(c) {
				var part = {
					type: 'Feature',
					properties: props,
					geometry: {
						type: 'Point',
						coordinates: c
					}			
				}
				r.push(part)
			})
		}
	})
	return r
}

},{}],18:[function(require,module,exports){
exports.labels = function(style) {
	var s = {
		'opacity': 1,
		'fill': 'black',
		'stroke': 'none',
		'font-family': 'sans-serif',
		'font-size': '10px',
		'text-anchor': 'middle'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}

exports.markers = function(style) {
	var s = {
		'opacity': 1
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}

},{}],19:[function(require,module,exports){
module.exports = function(feats) {
	var r = []
	feats.forEach(function(f) {
		if(f.geometry.type === 'Polygon') { r.push(f) }
		else if(f.geometry.type === 'MultiPolygon') {
			var cs = f.geometry.coordinates
			var props = f.properties
			cs.forEach(function(c) {
				var part = {
					type: 'Feature',
					properties: props,
					geometry: {
						type: 'Polygon',
						coordinates: c
					}			
				}
				r.push(part)
			})
		}
	})

	return r
}

},{}],20:[function(require,module,exports){
module.exports = function(style) {
	var s = {
		'opacity': 1,
		'fill': 'black',
		'stroke': 'none',
		'line-width': 1,
		'line-join': 'round',
		'line-cap': 'round'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}

},{}],21:[function(require,module,exports){
var tilebelt = require('tilebelt')

module.exports = function(left, right, z) {
	var leftFrac = tilebelt.pointToTileFraction(left[0], left[1], z)
	var rightFrac = tilebelt.pointToTileFraction(right[0], right[1], z)
	var pixels = (rightFrac[0] - leftFrac[0]) * 256
	return pixels
}


},{"tilebelt":65}],22:[function(require,module,exports){
module.exports = function(options, parsedUrl) {
	var o = {
		'subdomains': 'abc'
	}
	for(k in options) {
		o[k] = options[k]
	}
	var errs = []

	parsedUrl.forEach(function(part) {
		if(part.type === 'var') {
			if(part.key === 's') { part.val = o.subdomains }
			else if(part.key !== 'x' && part.key !== 'y' && part.key !== 'z') {
				if(o[part.key] === undefined) { errs.push(part.key) }
				else { part.val = o[part.key] } 
			}
		}
	})

	if(errs.length === 0) { return parsedUrl }
	else {
		console.log('ERROR: some attributes are missing to parse Tiles URL:')
		errs.forEach(function(err) { console.log(' * ' + err) })
		return null
	}
}

},{}],23:[function(require,module,exports){
var tilebelt = require('tilebelt')

module.exports = function(o, map) {
	if(o.options === null) { return null }
	else {
		var bbox = map.bbox
		var topLeftTile = tilebelt.pointToTile(bbox[0], bbox[3], o.z)
		var bottomRightTile = tilebelt.pointToTile(bbox[2], bbox[1], o.z)
		var tiles = []
		for(x=topLeftTile[0];x<bottomRightTile[0] + 1;x++) {
			for(y=topLeftTile[1];y<bottomRightTile[1] + 1;y++) {
				tiles.push([x, y, o.z])
			}
		}
		return tiles
	}
}

},{"tilebelt":65}],24:[function(require,module,exports){
var tilebelt = require('tilebelt')

module.exports = function(t, p) {
	var bb = tilebelt.tileToBBOX(t)
	var min = p([bb[0], bb[3]])
	var max = p([bb[2], bb[1]])
	var r = {
		x: min[0],
		y: min[1],
		width: max[0] - min[0],
		height: max[1] - min[1]
	}
	return r
}

},{"tilebelt":65}],25:[function(require,module,exports){
var getPosition = require('./get-position')
var getUrl = require('./get-url')

module.exports = function(o, map) {
	if(o.options === null) { return null }
	else {
		var tiles = o.tiles
		var urlModel = o.parsedUrl
		var r = []
		tiles.forEach(function(t) {
			var x = getPosition(t, map.proj.projection)
			x.url = getUrl(urlModel, t)
			r.push(x)
		})
		return r
	}
}

},{"./get-position":24,"./get-url":26}],26:[function(require,module,exports){
module.exports = function(urlModel, t) {
	var url = ''
	urlModel.forEach(function(u) {
		if(u.type === 'string') { url = url + u.val }
		else if(u.type === 'var') {
			if(u.key === 'x') { url = url + t[0] }
			else if(u.key === 'y') { url = url + t[1] }
			else if(u.key === 'z') { url = url + t[2] }
			else if(u.key === 's') { url = url + u.val[Math.floor(Math.random() * u.val.length)] }
			else { url = url + u.val }
		}
	})
	return url
}

},{}],27:[function(require,module,exports){
var calcPixels = require('./calc-pixels')
var tilebelt = require('tilebelt')

module.exports = function(o, map) {
	var bbox = map.bbox
	var z = tilebelt.bboxToTile(bbox)[2]
	var left = [bbox[0], bbox[1]]
	var right = [bbox[2], bbox[1]]
	while(calcPixels(left, right, z) < map.size.width) {
		z++
	}
	return z
}

},{"./calc-pixels":21,"tilebelt":65}],28:[function(require,module,exports){
module.exports = function(o, map) {
	var tiles = o.tilesInfo
	map.imagesLoading = map.imagesLoading + tiles.length
	tiles.forEach(function(t) {
		var img = new Image()
		img.addEventListener('load', function() {
			map.imagesDoneLoading()
			t.img = img
		}, false)
		img.src = t.url
	})
}

},{}],29:[function(require,module,exports){
module.exports = function(url) {
	var parts1 = url.split('{')
	var parts = []
	parts1.forEach(function(part, i) {
		if(i === 0) { parts.push({type: 'string', val: part}) }
		else {
			var p = part.split('}')
			parts.push({type: 'var', key: p[0], val: undefined})
			parts.push({type: 'string', val: p[1]})
		}
	})
	return parts
}

},{}],30:[function(require,module,exports){
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.1.20151003
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		// See https://code.google.com/p/chromium/issues/detail?id=375297#c7 and
		// https://github.com/eligrey/FileSaver.js/commit/485930a#commitcomment-8768047
		// for the reasoning behind the timeout and revocation flow
		, arbitrary_revoke_timeout = 500 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			if (view.chrome) {
				revoker();
			} else {
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob(["\ufeff", blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if (target_view && is_safari && typeof FileReader !== "undefined") {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var base64Data = reader.result;
							target_view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						var new_tab = view.open(object_url, "_blank");
						if (new_tab == undefined && is_safari) {
							//Apple do not allow window.open, see http://bit.ly/1kZffRI
							view.location.href = object_url
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			// Update: Google errantly closed 91158, I submitted it again:
			// https://code.google.com/p/chromium/issues/detail?id=389642
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
									revoke(file);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name, no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name || "download");
		};
	}

	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() {
    return saveAs;
  });
}

module.exports = saveAs

},{}],31:[function(require,module,exports){
var geo = require('d3-geo').geo

module.exports = function(canvas, bbox) {
	if(bbox[0] < -179.99) { bbox[0] = -179.99 }
	if(bbox[1] < -85) { bbox[1] = -85 }
	if(bbox[2] > 179.99) { bbox[2] = 179.99 }
	if(bbox[3] > 85) { bbox[3] = 85 }
	var collection = createCol(bbox)
	var projection = geo.mercator()
		  .scale(1)
		  .translate([0, 0])
	var path = geo.path()
		  .projection(projection)
	var b = path.bounds(collection)
	var s = .95 /Math.max((b[1][0] - b[0][0]) /canvas.width, (b[1][1] - b[0][1]) /canvas.height)
	var t = [(canvas.width - s * (b[1][0] + b[0][0])) /2, (canvas.height - s * (b[1][1] + b[0][1])) /2]
	projection
		  .scale(s)
		  .translate(t)

	return {path: path, projection: projection}
}

function createCol(bbox) {
	return {
		type: 'FeatureCollection',
		features: [
			{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [bbox[0], bbox[1]] } },
			{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [bbox[2], bbox[3]] } }
		]
	}
}

},{"d3-geo":58}],32:[function(require,module,exports){
var cleanFeatures = require('./polygons/clean-features')
var setDefaultStyle = require('./polygons/set-default-style')
var appendLayer = require('./choropleth/append-layer')
var getScale = require('./choropleth/get-scale')
var getDomain = require('./choropleth/get-domain')
var addFill = require('./choropleth/add-fill')

module.exports = function(layerId, feats, opts, style, map) {
	if(opts === undefined) { console.log('Scale options are undefined') }
	else if(opts.type === undefined) { console.log('Type is undefined') }
	else if(Array.isArray(opts.range) === false || opts.range.length < 2) { console.log('Range is not an array') }
	else if(opts.range === undefined) { console.log('Range is undefined') }
	else if(opts.prop === undefined) { console.log('Prop is undefined') }
	else {
		var self = this
		self.id = layerId
		self.features = cleanFeatures(feats)
		self.style = setDefaultStyle(style)
		self.prop = opts.prop
		self.type = opts.type
		self.range = opts.range
		self.domain = getDomain(self)
		self.scale = getScale(self)
		addFill(self)
		appendLayer(self, map) 
		return this
	}
}









},{"./choropleth/add-fill":38,"./choropleth/append-layer":39,"./choropleth/get-domain":40,"./choropleth/get-scale":41,"./polygons/clean-features":51,"./polygons/set-default-style":52}],33:[function(require,module,exports){
var cleanFeatures = require('./points/clean-features')
var appendLayer = require('./points/append-layer').labels
var setDefaultStyle = require('./points/set-default-style')

module.exports = function(layerId, feats, prop, style, transform, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.prop = prop
	self.style = setDefaultStyle(style)
	self.transform = transform
	appendLayer(self, map)
	return this
}



},{"./points/append-layer":47,"./points/clean-features":48,"./points/set-default-style":49}],34:[function(require,module,exports){
var cleanFeatures = require('./lines/clean-features')
var addLabels = require('./lines/add-labels')
var appendLayer = require('./lines/append-layer')
var setDefaultStyle = require('./lines/set-default-style')

module.exports = function(layerId, feats, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.style = setDefaultStyle(style)
	self.labels = undefined
	self.addLabels = function(prop, style, uppercase) {
		self.labels = addLabels(prop, style, uppercase, self, map)
	}
	appendLayer(self, map)
	return this
}



},{"./lines/add-labels":43,"./lines/append-layer":44,"./lines/clean-features":45,"./lines/set-default-style":46}],35:[function(require,module,exports){
var cleanFeatures = require('./points/clean-features')
var appendLayer = require('./points/append-layer').markers

module.exports = function(layerId, feats, url, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.url = url
	self.style = style
	appendLayer(self, map)
	return this
}



},{"./points/append-layer":47,"./points/clean-features":48}],36:[function(require,module,exports){
var cleanFeatures = require('./polygons/clean-features')
var setDefaultStyle = require('./polygons/set-default-style')
var appendLayer = require('./polygons/append-layer')

module.exports = function(layerId, feats, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.style = setDefaultStyle(style)
	appendLayer(self, map)
	return this
}





},{"./polygons/append-layer":50,"./polygons/clean-features":51,"./polygons/set-default-style":52}],37:[function(require,module,exports){
module.exports = function(color, svgId, size) {
	var rect = document.createElementNS('http://www.w3.org/2000/svg','rect')
	rect.setAttribute('x', 0)
	rect.setAttribute('y', 0)
	rect.setAttribute('width', size.width)
	rect.setAttribute('height', size.height)
	rect.setAttribute('style', 'fill:' + color)
	var svg = document.getElementById(svgId)
	svg.appendChild(rect)
}

},{}],38:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"dup":10}],39:[function(require,module,exports){
var styleString = require('../utils').styleString

module.exports = function(polygons, map) {
	var id = polygons.id
	var feats = polygons.features
	var style = rmFill(polygons.style)
	var path = map.proj.path
	var svgId = map.id
	var g = document.createElementNS('http://www.w3.org/2000/svg','g')
	g.id = 'layer-' + id
	var str = ''
	for(i=0;i<feats.length;i++) {
		if(feats[i].properties.fill === undefined) {
			var color = style.fill
		} else {
			var color = feats[i].properties.fill
		}
		str = str + '<path id="layer-' + id + '-' + i +'" '
			+ 'd="' + path(feats[i]) + '" '
			+ 'style="' + styleString(style.rest) + ';fill:' + color + '" '
			+ '></path>'
	}
	g.innerHTML = str
	var svg = document.getElementById(svgId)
	svg.appendChild(g)
}

function rmFill(o) {
	var r = {}
	var fill = null
	for(k in o) {
		if(k === 'fill') {
			fill = o[k]
		} else {
			r[k] = o[k]
		}
	}
	return {
		fill: fill,
		rest: r
	}
}



},{"../utils":53}],40:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11}],41:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"d3-scale":60,"dup":12}],42:[function(require,module,exports){
var getProj = require('../get-proj')
var saveAs = require('../file-saver')

var Lines = require('./Lines')
var Polygons = require('./Polygons')
var Markers = require('./Markers')
var Labels = require('./Labels')
var Choropleth = require('./Choropleth')
var background = require('./background')

module.exports = function(divId, w, h, bbox) {
	var self = this
	self.id = Date.now()
	self.div = document.getElementById(divId)	
	self.size = {width: w, height: h}
	self.div.innerHTML = '<svg '
		+ 'width="' + self.size.width + '" '
		+ 'height="' + self.size.height + '" '
		+ 'id="' + self.id
		+'" ></svg>'
	self.bbox = bbox
	self.proj = getProj(self.size, self.bbox)
	self.layerId = 0
	self.newLayerId = function() { self.layerId = self.layerId + 1; return self.layerId }
	self.textPositions = []
	self.background = function(color) { background(color, self.id, self.size) }
	self.markers = function(col, url, style) {
		var x = new Markers(self.newLayerId(), col.features, url, style, self)
		return x
	}
	self.labels = function(col, prop, style, transform) {
		var x = new Labels(self.newLayerId(), col.features, prop, style, transform, self)
		return x
	}
	self.lines = function(col, style) {
		var x = new Lines(self.newLayerId(), col.features, style, self)
		return x
	}
	self.polygons = function(col, style) {
		var x = new Polygons(self.newLayerId(), col.features, style, self)
		return x
	}
	self.choropleth = function(col, opts, style) {
		var x = new Choropleth(self.newLayerId(), col.features, opts, style, self)
		return x
	}
	self.draw = function() {
		console.log('karto.svg() does not need .draw()')
	}
	self.tiles = function() {
		console.log('karto.svg() does not have .tiles(), use karto.canvas() instead')
	}
	self.downloadButton = function() {
		var svgContent = document.getElementById(self.id).innerHTML
		var svg = '<svg '
		+ 'xmlns="http://www.w3.org/2000/svg" '
  + 'xmlns:xlink="http://www.w3.org/1999/xlink" '
		+ 'width="' + self.size.width + '" '
		+ 'height="' + self.size.height + '" '
		+'" >' + svgContent + '</svg>'

		var btn = document.createElement('button')
		btn.innerHTML = 'Download'
		btn.style.position = 'fixed'
		btn.style.top = '10px'
		btn.style.left = '10px'
		btn.onclick = function() {
			var blob = new Blob([svg], {type: "text/plain;charset=utf-8"})
			saveAs(blob, "map.svg")
		}
		self.div.appendChild(btn)
	}
	return this
}

},{"../file-saver":30,"../get-proj":31,"./Choropleth":32,"./Labels":33,"./Lines":34,"./Markers":35,"./Polygons":36,"./background":37}],43:[function(require,module,exports){
var styleString = require('../utils').styleString
var rmElById = require('../utils').rmElById

module.exports = function(prop, style, uppercase, lines, map) {
	var id = lines.id
	var feats = lines.features
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

},{"../utils":53}],44:[function(require,module,exports){
var styleString = require('../utils').styleString

module.exports = function(lines, map) {
	var id = lines.id
	var feats = lines.features
	var style = lines.style
	var path = map.proj.path
	var svgId = map.id
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

},{"../utils":53}],45:[function(require,module,exports){
module.exports = function(feats) {
	var r = []
	for(i=0;i<feats.length;i++) {
		if(feats[i].geometry.type === 'LineString' || feats[i].geometry.type === 'MultiLineString' ) {
			var f = ensureLeftToRight(feats[i])
			r.push(f)
		}
	}
	return r
}

function ensureLeftToRight(feat) {
	var t = feat.geometry.type
	if(t === 'LineString') {
		var c = feat.geometry.coordinates
		feat.geometry.coordinates = invertIfNeed(c)
	} else {
		var cs = feat.geometry.coordinates
		var newCs = []
		for(i=0;i<cs.length;i++) {
			newCs.push(invertIfNeed(cs[i]))
		}
		feat.geometry.coordinates = newCs
	}
	return feat
}

function invertIfNeed(arr) {
	var first = arr[0]
	var last = arr[arr.length - 1]
	var invert = false
	if(first[0] > last[0]) { arr.reverse() }
	return arr
}

},{}],46:[function(require,module,exports){
module.exports = function(style) {
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

},{}],47:[function(require,module,exports){
var styleString = require('../utils').styleString

exports.markers = function(markers, map) {
	var id = markers.id
	var feats = markers.features
	var url = markers.url
	var style = markers.style
	var projection = map.proj.projection
	var svgId = map.id
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

exports.labels = function(labels, map) {
	var id = labels.id
	var feats = labels.features
	var prop = labels.prop
	var style = labels.style
	var transform = labels.transform
	var proj = map.proj.projection
	var svgId = map.id
	if(transform !== undefined) { t = 'transform="translate(' + transform[0] + ' ' + transform[1] + ')" ' } else { t='' }
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



},{"../utils":53}],48:[function(require,module,exports){
module.exports = function(feats) {
	var r = []
	for(i=0;i<feats.length;i++) {
		if(feats[i].geometry.type === 'Point') {
			r.push(feats[i])
		} else if(feats[i].geometry.type === 'MultiPoint' ) {
			var c = feats[i].geometry.coordinates
			var prop = feats[i].properties
			for(j=0;j<c.length;j++) {
				r.push({
					type: 'Feature',
					properties: props,
					geometry: {
						type: 'Point',
						coordinates: c[j]
					}
				})
			}
		}
	}
	return r
}

},{}],49:[function(require,module,exports){
module.exports = function(style) {
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

},{}],50:[function(require,module,exports){
var styleString = require('../utils').styleString

module.exports = function(polygons, map) {
	var id = polygons.id
	var feats = polygons.features
	var style = polygons.style
	var path = map.proj.path
	var svgId = map.id
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

},{"../utils":53}],51:[function(require,module,exports){
module.exports = function(feats) {
	var r = []
	for(i=0;i<feats.length;i++) {
		if(feats[i].geometry.type === 'Polygon' || feats[i].geometry.type === 'MultiPolygon' ) {
			r.push(feats[i])
		}
	}
	return r
}

},{}],52:[function(require,module,exports){
module.exports = function(style) {
	var s = {
		'fill': 'black',
		'stroke': 'none'
	}
	if(style !== undefined) {
		for(k in style) { s[k] = style[k] }
	}
	return s
}

},{}],53:[function(require,module,exports){
exports.styleString = function(o) {
	var str = ''
	for(k in o) {
		str = str + k + ':' + o[k] + ';'
	}
	return str
}

exports.rmElById = function(elId) {
	var el = document.getElementById(elId)
	el.parentNode.removeChild(el)
}

},{}],54:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3_array = {})));
}(this, function (exports) { 'use strict';

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector(compare) {
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
      left: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }
    };
  }

  function ascendingComparator(f) {
    return function(d, x) {
      return ascending(f(d), x);
    };
  }

  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;
  var bisectLeft = ascendingBisect.left;

  function descending(a, b) {
    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  }

  function number$1(x) {
    return x === null ? NaN : +x;
  }

  function variance(array, f) {
    var n = array.length,
        m = 0,
        a,
        d,
        s = 0,
        i = -1,
        j = 0;

    if (f == null) {
      while (++i < n) {
        if (!isNaN(a = number$1(array[i]))) {
          d = a - m;
          m += d / ++j;
          s += d * (a - m);
        }
      }
    }

    else {
      while (++i < n) {
        if (!isNaN(a = number$1(f(array[i], i, array)))) {
          d = a - m;
          m += d / ++j;
          s += d * (a - m);
        }
      }
    }

    if (j > 1) return s / (j - 1);
  }

  function deviation(array, f) {
    var v = variance(array, f);
    return v ? Math.sqrt(v) : v;
  }

  function extent(array, f) {
    var i = -1,
        n = array.length,
        a,
        b,
        c;

    if (f == null) {
      while (++i < n) if ((b = array[i]) != null && b >= b) { a = c = b; break; }
      while (++i < n) if ((b = array[i]) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    }

    else {
      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = c = b; break; }
      while (++i < n) if ((b = f(array[i], i, array)) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    }

    return [a, c];
  }

  function constant(x) {
    return function() {
      return x;
    };
  }

  function identity(x) {
    return x;
  }

  function range(start, stop, step) {
    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

    var i = -1,
        n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
        range = new Array(n);

    while (++i < n) {
      range[i] = start + i * step;
    }

    return range;
  }

  var e10 = Math.sqrt(50);
  var e5 = Math.sqrt(10);
  var e2 = Math.sqrt(2);
  function ticks(start, stop, count) {
    var step = tickStep(start, stop, count);
    return range(
      Math.ceil(start / step) * step,
      Math.floor(stop / step) * step + step / 2, // inclusive
      step
    );
  }

  function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;
    else if (error >= e5) step1 *= 5;
    else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
  }

  function sturges(values) {
    return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
  }

  function number(x) {
    return +x;
  }

  function histogram() {
    var value = identity,
        domain = extent,
        threshold = sturges;

    function histogram(data) {
      var i,
          n = data.length,
          x,
          values = new Array(n);

      // Coerce values to numbers.
      for (i = 0; i < n; ++i) {
        values[i] = +value(data[i], i, data);
      }

      var xz = domain(values),
          x0 = +xz[0],
          x1 = +xz[1],
          tz = threshold(values, x0, x1);

      // Convert number of thresholds into uniform thresholds.
      if (!Array.isArray(tz)) tz = ticks(x0, x1, +tz);

      // Coerce thresholds to numbers, ignoring any outside the domain.
      var m = tz.length;
      for (i = 0; i < m; ++i) tz[i] = +tz[i];
      while (tz[0] <= x0) tz.shift(), --m;
      while (tz[m - 1] >= x1) tz.pop(), --m;

      var bins = new Array(m + 1),
          bin;

      // Initialize bins.
      for (i = 0; i <= m; ++i) {
        bin = bins[i] = [];
        bin.x0 = i > 0 ? tz[i - 1] : x0;
        bin.x1 = i < m ? tz[i] : x1;
      }

      // Assign data to bins by value, ignoring any outside the domain.
      for (i = 0; i < n; ++i) {
        x = values[i];
        if (x0 <= x && x <= x1) {
          bins[bisectRight(tz, x, 0, m)].push(data[i]);
        }
      }

      return bins;
    }

    histogram.value = function(_) {
      return arguments.length ? (value = typeof _ === "function" ? _ : constant(+_), histogram) : value;
    };

    histogram.domain = function(_) {
      return arguments.length ? (domain = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), histogram) : domain;
    };

    histogram.thresholds = function(_) {
      if (!arguments.length) return threshold;
      threshold = typeof _ === "function" ? _
          : Array.isArray(_) ? constant(Array.prototype.map.call(_, number))
          : constant(+_);
      return histogram;
    };

    return histogram;
  }

  function quantile(array, p, f) {
    if (f == null) f = number$1;
    if (!(n = array.length)) return;
    if ((p = +p) <= 0 || n < 2) return +f(array[0], 0, array);
    if (p >= 1) return +f(array[n - 1], n - 1, array);
    var n,
        h = (n - 1) * p,
        i = Math.floor(h),
        a = +f(array[i], i, array),
        b = +f(array[i + 1], i + 1, array);
    return a + (b - a) * (h - i);
  }

  function freedmanDiaconis(values, min, max) {
    values.sort(ascending);
    return Math.ceil((max - min) / (2 * (quantile(values, 0.75) - quantile(values, 0.25)) * Math.pow(values.length, -1 / 3)));
  }

  function scott(values, min, max) {
    return Math.ceil((max - min) / (3.5 * deviation(values) * Math.pow(values.length, -1 / 3)));
  }

  function max(array, f) {
    var i = -1,
        n = array.length,
        a,
        b;

    if (f == null) {
      while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
    }

    else {
      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
      while (++i < n) if ((b = f(array[i], i, array)) != null && b > a) a = b;
    }

    return a;
  }

  function mean(array, f) {
    var s = 0,
        n = array.length,
        a,
        i = -1,
        j = n;

    if (f == null) {
      while (++i < n) if (!isNaN(a = number$1(array[i]))) s += a; else --j;
    }

    else {
      while (++i < n) if (!isNaN(a = number$1(f(array[i], i, array)))) s += a; else --j;
    }

    if (j) return s / j;
  }

  function median(array, f) {
    var numbers = [],
        n = array.length,
        a,
        i = -1;

    if (f == null) {
      while (++i < n) if (!isNaN(a = number$1(array[i]))) numbers.push(a);
    }

    else {
      while (++i < n) if (!isNaN(a = number$1(f(array[i], i, array)))) numbers.push(a);
    }

    return quantile(numbers.sort(ascending), 0.5);
  }

  function merge(arrays) {
    var n = arrays.length,
        m,
        i = -1,
        j = 0,
        merged,
        array;

    while (++i < n) j += arrays[i].length;
    merged = new Array(j);

    while (--n >= 0) {
      array = arrays[n];
      m = array.length;
      while (--m >= 0) {
        merged[--j] = array[m];
      }
    }

    return merged;
  }

  function min(array, f) {
    var i = -1,
        n = array.length,
        a,
        b;

    if (f == null) {
      while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
    }

    else {
      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
      while (++i < n) if ((b = f(array[i], i, array)) != null && a > b) a = b;
    }

    return a;
  }

  function pairs(array) {
    var i = 0, n = array.length - 1, p = array[0], pairs = new Array(n < 0 ? 0 : n);
    while (i < n) pairs[i] = [p, p = array[++i]];
    return pairs;
  }

  function permute(array, indexes) {
    var i = indexes.length, permutes = new Array(i);
    while (i--) permutes[i] = array[indexes[i]];
    return permutes;
  }

  function scan(array, compare) {
    if (!(n = array.length)) return;
    var i = 0,
        n,
        j = 0,
        xi,
        xj = array[j];

    if (!compare) compare = ascending;

    while (++i < n) if (compare(xi = array[i], xj) < 0 || compare(xj, xj) !== 0) xj = xi, j = i;

    if (compare(xj, xj) === 0) return j;
  }

  function shuffle(array, i0, i1) {
    var m = (i1 == null ? array.length : i1) - (i0 = i0 == null ? 0 : +i0),
        t,
        i;

    while (m) {
      i = Math.random() * m-- | 0;
      t = array[m + i0];
      array[m + i0] = array[i + i0];
      array[i + i0] = t;
    }

    return array;
  }

  function sum(array, f) {
    var s = 0,
        n = array.length,
        a,
        i = -1;

    if (f == null) {
      while (++i < n) if (a = +array[i]) s += a; // Note: zero and null are equivalent.
    }

    else {
      while (++i < n) if (a = +f(array[i], i, array)) s += a;
    }

    return s;
  }

  function transpose(matrix) {
    if (!(n = matrix.length)) return [];
    for (var i = -1, m = min(matrix, length), transpose = new Array(m); ++i < m;) {
      for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
        row[j] = matrix[j][i];
      }
    }
    return transpose;
  }

  function length(d) {
    return d.length;
  }

  function zip() {
    return transpose(arguments);
  }

  var version = "0.7.1";

  exports.version = version;
  exports.bisect = bisectRight;
  exports.bisectRight = bisectRight;
  exports.bisectLeft = bisectLeft;
  exports.ascending = ascending;
  exports.bisector = bisector;
  exports.descending = descending;
  exports.deviation = deviation;
  exports.extent = extent;
  exports.histogram = histogram;
  exports.thresholdFreedmanDiaconis = freedmanDiaconis;
  exports.thresholdScott = scott;
  exports.thresholdSturges = sturges;
  exports.max = max;
  exports.mean = mean;
  exports.median = median;
  exports.merge = merge;
  exports.min = min;
  exports.pairs = pairs;
  exports.permute = permute;
  exports.quantile = quantile;
  exports.range = range;
  exports.scan = scan;
  exports.shuffle = shuffle;
  exports.sum = sum;
  exports.ticks = ticks;
  exports.tickStep = tickStep;
  exports.transpose = transpose;
  exports.variance = variance;
  exports.zip = zip;

}));
},{}],55:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3_collection = global.d3_collection || {})));
}(this, function (exports) { 'use strict';

  var prefix = "$";

  function Map() {}

  Map.prototype = map.prototype = {
    constructor: Map,
    has: function(key) {
      return (prefix + key) in this;
    },
    get: function(key) {
      return this[prefix + key];
    },
    set: function(key, value) {
      this[prefix + key] = value;
      return this;
    },
    remove: function(key) {
      var property = prefix + key;
      return property in this && delete this[property];
    },
    clear: function() {
      for (var property in this) if (property[0] === prefix) delete this[property];
    },
    keys: function() {
      var keys = [];
      for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
      return keys;
    },
    values: function() {
      var values = [];
      for (var property in this) if (property[0] === prefix) values.push(this[property]);
      return values;
    },
    entries: function() {
      var entries = [];
      for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
      return entries;
    },
    size: function() {
      var size = 0;
      for (var property in this) if (property[0] === prefix) ++size;
      return size;
    },
    empty: function() {
      for (var property in this) if (property[0] === prefix) return false;
      return true;
    },
    each: function(f) {
      for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
    }
  };

  function map(object, f) {
    var map = new Map;

    // Copy constructor.
    if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

    // Index array by numeric index or specified key function.
    else if (Array.isArray(object)) {
      var i = -1,
          n = object.length,
          o;

      if (f == null) while (++i < n) map.set(i, object[i]);
      else while (++i < n) map.set(f(o = object[i], i, object), o);
    }

    // Convert object to map.
    else if (object) for (var key in object) map.set(key, object[key]);

    return map;
  }

  function nest() {
    var keys = [],
        sortKeys = [],
        sortValues,
        rollup,
        nest;

    function apply(array, depth, createResult, setResult) {
      if (depth >= keys.length) return rollup
          ? rollup(array) : (sortValues
          ? array.sort(sortValues)
          : array);

      var i = -1,
          n = array.length,
          key = keys[depth++],
          keyValue,
          value,
          valuesByKey = map(),
          values,
          result = createResult();

      while (++i < n) {
        if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
          values.push(value);
        } else {
          valuesByKey.set(keyValue, [value]);
        }
      }

      valuesByKey.each(function(values, key) {
        setResult(result, key, apply(values, depth, createResult, setResult));
      });

      return result;
    }

    function entries(map, depth) {
      if (depth >= keys.length) return map;

      var array = [],
          sortKey = sortKeys[depth++];

      map.each(function(value, key) {
        array.push({key: key, values: entries(value, depth)});
      });

      return sortKey
          ? array.sort(function(a, b) { return sortKey(a.key, b.key); })
          : array;
    }

    return nest = {
      object: function(array) { return apply(array, 0, createObject, setObject); },
      map: function(array) { return apply(array, 0, createMap, setMap); },
      entries: function(array) { return entries(apply(array, 0, createMap, setMap), 0); },
      key: function(d) { keys.push(d); return nest; },
      sortKeys: function(order) { sortKeys[keys.length - 1] = order; return nest; },
      sortValues: function(order) { sortValues = order; return nest; },
      rollup: function(f) { rollup = f; return nest; }
    };
  }

  function createObject() {
    return {};
  }

  function setObject(object, key, value) {
    object[key] = value;
  }

  function createMap() {
    return map();
  }

  function setMap(map, key, value) {
    map.set(key, value);
  }

  function Set() {}

  var proto = map.prototype;

  Set.prototype = set.prototype = {
    constructor: Set,
    has: proto.has,
    add: function(value) {
      value += "";
      this[prefix + value] = value;
      return this;
    },
    remove: proto.remove,
    clear: proto.clear,
    values: proto.keys,
    size: proto.size,
    empty: proto.empty,
    each: proto.each
  };

  function set(object, f) {
    var set = new Set;

    // Copy constructor.
    if (object instanceof Set) object.each(function(value) { set.add(value); });

    // Otherwise, assume it’s an array.
    else if (object) {
      var i = -1, n = object.length;
      if (f == null) while (++i < n) set.add(object[i]);
      else while (++i < n) set.add(f(object[i], i, object));
    }

    return set;
  }

  function keys(map) {
    var keys = [];
    for (var key in map) keys.push(key);
    return keys;
  }

  function values(map) {
    var values = [];
    for (var key in map) values.push(map[key]);
    return values;
  }

  function entries(map) {
    var entries = [];
    for (var key in map) entries.push({key: key, value: map[key]});
    return entries;
  }

  var version = "0.1.2";

  exports.version = version;
  exports.nest = nest;
  exports.set = set;
  exports.map = map;
  exports.keys = keys;
  exports.values = values;
  exports.entries = entries;

}));
},{}],56:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3_color = global.d3_color || {})));
}(this, function (exports) { 'use strict';

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reHex3 = /^#([0-9a-f]{3})$/;
  var reHex6 = /^#([0-9a-f]{6})$/;
  var reRgbInteger = /^rgb\(\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*\)$/;
  var reRgbPercent = /^rgb\(\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*\)$/;
  var reRgbaInteger = /^rgba\(\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)$/;
  var reRgbaPercent = /^rgba\(\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)$/;
  var reHslPercent = /^hsl\(\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*\)$/;
  var reHslaPercent = /^hsla\(\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)$/;
  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    displayable: function() {
      return this.rgb().displayable();
    },
    toString: function() {
      return this.rgb() + "";
    }
  });

  function color(format) {
    var m;
    format = (format + "").trim().toLowerCase();
    return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
        : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format])
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function() {
      return this;
    },
    displayable: function() {
      return (0 <= this.r && this.r <= 255)
          && (0 <= this.g && this.g <= 255)
          && (0 <= this.b && this.b <= 255)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    toString: function() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }
  }));

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    displayable: function() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    }
  }));

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  var deg2rad = Math.PI / 180;
  var rad2deg = 180 / Math.PI;

  var Kn = 18;
  var Xn = 0.950470;
  var Yn = 1;
  var Zn = 1.088830;
  var t0 = 4 / 29;
  var t1 = 6 / 29;
  var t2 = 3 * t1 * t1;
  var t3 = t1 * t1 * t1;
  function labConvert(o) {
    if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
    if (o instanceof Hcl) {
      var h = o.h * deg2rad;
      return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
    }
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var b = rgb2xyz(o.r),
        a = rgb2xyz(o.g),
        l = rgb2xyz(o.b),
        x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
        y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
        z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
    return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
  }

  function lab(l, a, b, opacity) {
    return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
  }

  function Lab(l, a, b, opacity) {
    this.l = +l;
    this.a = +a;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Lab, lab, extend(Color, {
    brighter: function(k) {
      return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    darker: function(k) {
      return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    rgb: function() {
      var y = (this.l + 16) / 116,
          x = isNaN(this.a) ? y : y + this.a / 500,
          z = isNaN(this.b) ? y : y - this.b / 200;
      y = Yn * lab2xyz(y);
      x = Xn * lab2xyz(x);
      z = Zn * lab2xyz(z);
      return new Rgb(
        xyz2rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
        xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
        xyz2rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
        this.opacity
      );
    }
  }));

  function xyz2lab(t) {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
  }

  function lab2xyz(t) {
    return t > t1 ? t * t * t : t2 * (t - t0);
  }

  function xyz2rgb(x) {
    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  }

  function rgb2xyz(x) {
    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }

  function hclConvert(o) {
    if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
    if (!(o instanceof Lab)) o = labConvert(o);
    var h = Math.atan2(o.b, o.a) * rad2deg;
    return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
  }

  function hcl(h, c, l, opacity) {
    return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
  }

  function Hcl(h, c, l, opacity) {
    this.h = +h;
    this.c = +c;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hcl, hcl, extend(Color, {
    brighter: function(k) {
      return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
    },
    darker: function(k) {
      return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
    },
    rgb: function() {
      return labConvert(this).rgb();
    }
  }));

  var A = -0.14861;
  var B = +1.78277;
  var C = -0.29227;
  var D = -0.90649;
  var E = +1.97294;
  var ED = E * D;
  var EB = E * B;
  var BC_DA = B * C - D * A;
  function cubehelixConvert(o) {
    if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
        bl = b - l,
        k = (E * (g - l) - C * bl) / D,
        s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
        h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
    return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
  }

  function cubehelix(h, s, l, opacity) {
    return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
  }

  function Cubehelix(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Cubehelix, cubehelix, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
          l = +this.l,
          a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
          cosh = Math.cos(h),
          sinh = Math.sin(h);
      return new Rgb(
        255 * (l + a * (A * cosh + B * sinh)),
        255 * (l + a * (C * cosh + D * sinh)),
        255 * (l + a * (E * cosh)),
        this.opacity
      );
    }
  }));

  var version = "0.4.2";

  exports.version = version;
  exports.color = color;
  exports.rgb = rgb;
  exports.hsl = hsl;
  exports.lab = lab;
  exports.hcl = hcl;
  exports.cubehelix = cubehelix;

}));
},{}],57:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3_format = {})));
}(this, function (exports) { 'use strict';

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimal(1.23) returns ["123", 0].
  function formatDecimal(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i, coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  function exponent(x) {
    return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
  }

  function formatGroup(grouping, thousands) {
    return function(value, width) {
      var i = value.length,
          t = [],
          j = 0,
          g = grouping[0],
          length = 0;

      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }

      return t.reverse().join(thousands);
    };
  }

  function formatDefault(x, p) {
    x = x.toPrecision(p);

    out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (x[i]) {
        case ".": i0 = i1 = i; break;
        case "0": if (i0 === 0) i0 = i; i1 = i; break;
        case "e": break out;
        default: if (i0 > 0) i0 = 0; break;
      }
    }

    return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
  }

  var prefixExponent;

  function formatPrefixAuto(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1],
        i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
        n = coefficient.length;
    return i === n ? coefficient
        : i > n ? coefficient + new Array(i - n + 1).join("0")
        : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
        : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
        : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
        : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "": formatDefault,
    "%": function(x, p) { return (x * 100).toFixed(p); },
    "b": function(x) { return Math.round(x).toString(2); },
    "c": function(x) { return x + ""; },
    "d": function(x) { return Math.round(x).toString(10); },
    "e": function(x, p) { return x.toExponential(p); },
    "f": function(x, p) { return x.toFixed(p); },
    "g": function(x, p) { return x.toPrecision(p); },
    "o": function(x) { return Math.round(x).toString(8); },
    "p": function(x, p) { return formatRounded(x * 100, p); },
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
    "x": function(x) { return Math.round(x).toString(16); }
  };

  // [[fill]align][sign][symbol][0][width][,][.precision][type]
  var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

  function formatSpecifier(specifier) {
    return new FormatSpecifier(specifier);
  }

  function FormatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);

    var match,
        fill = match[1] || " ",
        align = match[2] || ">",
        sign = match[3] || "-",
        symbol = match[4] || "",
        zero = !!match[5],
        width = match[6] && +match[6],
        comma = !!match[7],
        precision = match[8] && +match[8].slice(1),
        type = match[9] || "";

    // The "n" type is an alias for ",g".
    if (type === "n") comma = true, type = "g";

    // Map invalid types to the default format.
    else if (!formatTypes[type]) type = "";

    // If zero fill is specified, padding goes after sign and before digits.
    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

    this.fill = fill;
    this.align = align;
    this.sign = sign;
    this.symbol = symbol;
    this.zero = zero;
    this.width = width;
    this.comma = comma;
    this.precision = precision;
    this.type = type;
  }

  FormatSpecifier.prototype.toString = function() {
    return this.fill
        + this.align
        + this.sign
        + this.symbol
        + (this.zero ? "0" : "")
        + (this.width == null ? "" : Math.max(1, this.width | 0))
        + (this.comma ? "," : "")
        + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
        + this.type;
  };

  var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

  function identity(x) {
    return x;
  }

  function locale(locale) {
    var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity,
        currency = locale.currency,
        decimal = locale.decimal;

    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);

      var fill = specifier.fill,
          align = specifier.align,
          sign = specifier.sign,
          symbol = specifier.symbol,
          zero = specifier.zero,
          width = specifier.width,
          comma = specifier.comma,
          precision = specifier.precision,
          type = specifier.type;

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
          suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? "%" : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
          maybeSuffix = !type || /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision == null ? (type ? 6 : 12)
          : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
          : Math.max(0, Math.min(20, precision));

      function format(value) {
        var valuePrefix = prefix,
            valueSuffix = suffix,
            i, n, c;

        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Convert negative to positive, and compute the prefix.
          // Note that -0 is not less than 0, but 1 / -0 is!
          var valueNegative = (value < 0 || 1 / value < 0) && (value *= -1, true);

          // Perform the initial formatting.
          value = formatType(value, precision);

          // If the original value was negative, it may be rounded to zero during
          // formatting; treat this as (positive) zero.
          if (valueNegative) {
            i = -1, n = value.length;
            valueNegative = false;
            while (++i < n) {
              if (c = value.charCodeAt(i), (48 < c && c < 58)
                  || (type === "x" && 96 < c && c < 103)
                  || (type === "X" && 64 < c && c < 71)) {
                valueNegative = true;
                break;
              }
            }
          }

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = valueSuffix + (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
            padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<": return valuePrefix + value + valueSuffix + padding;
          case "=": return valuePrefix + padding + value + valueSuffix;
          case "^": return padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
        }
        return padding + valuePrefix + value + valueSuffix;
      }

      format.toString = function() {
        return specifier + "";
      };

      return format;
    }

    function formatPrefix(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
          e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
          k = Math.pow(10, -e),
          prefix = prefixes[8 + e / 3];
      return function(value) {
        return f(k * value) + prefix;
      };
    }

    return {
      format: newFormat,
      formatPrefix: formatPrefix
    };
  }

  var defaultLocale = locale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });

  var caES = locale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["", "\xa0€"]
  });

  var csCZ = locale({
    decimal: ",",
    thousands: "\xa0",
    grouping: [3],
    currency: ["", "\xa0Kč"]
  });

  var deCH = locale({
    decimal: ",",
    thousands: "'",
    grouping: [3],
    currency: ["", "\xa0CHF"]
  });

  var deDE = locale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["", "\xa0€"]
  });

  var enCA = locale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });

  var enGB = locale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["£", ""]
  });

  var esES = locale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["", "\xa0€"]
  });

  var fiFI = locale({
    decimal: ",",
    thousands: "\xa0",
    grouping: [3],
    currency: ["", "\xa0€"]
  });

  var frCA = locale({
    decimal: ",",
    thousands: "\xa0",
    grouping: [3],
    currency: ["", "$"]
  });

  var frFR = locale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["", "\xa0€"]
  });

  var heIL = locale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["₪", ""]
  });

  var huHU = locale({
    decimal: ",",
    thousands: "\xa0",
    grouping: [3],
    currency: ["", "\xa0Ft"]
  });

  var itIT = locale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["€", ""]
  });

  var jaJP = locale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["", "円"]
  });

  var koKR = locale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["₩", ""]
  });

  var mkMK = locale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["", "\xa0ден."]
  });

  var nlNL = locale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["€\xa0", ""]
  });

  var plPL = locale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["", "zł"]
  });

  var ptBR = locale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["R$", ""]
  });

  var ruRU = locale({
    decimal: ",",
    thousands: "\xa0",
    grouping: [3],
    currency: ["", "\xa0руб."]
  });

  var svSE = locale({
    decimal: ",",
    thousands: "\xa0",
    grouping: [3],
    currency: ["", "SEK"]
  });

  var zhCN = locale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["¥", ""]
  });

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }

  var format = defaultLocale.format;
  var formatPrefix = defaultLocale.formatPrefix;

  var version = "0.5.1";

  exports.version = version;
  exports.format = format;
  exports.formatPrefix = formatPrefix;
  exports.formatLocale = locale;
  exports.formatCaEs = caES;
  exports.formatCsCz = csCZ;
  exports.formatDeCh = deCH;
  exports.formatDeDe = deDE;
  exports.formatEnCa = enCA;
  exports.formatEnGb = enGB;
  exports.formatEnUs = defaultLocale;
  exports.formatEsEs = esES;
  exports.formatFiFi = fiFI;
  exports.formatFrCa = frCA;
  exports.formatFrFr = frFR;
  exports.formatHeIl = heIL;
  exports.formatHuHu = huHU;
  exports.formatItIt = itIT;
  exports.formatJaJp = jaJP;
  exports.formatKoKr = koKR;
  exports.formatMkMk = mkMK;
  exports.formatNlNl = nlNL;
  exports.formatPlPl = plPL;
  exports.formatPtBr = ptBR;
  exports.formatRuRu = ruRU;
  exports.formatSvSe = svSE;
  exports.formatZhCn = zhCN;
  exports.formatSpecifier = formatSpecifier;
  exports.precisionFixed = precisionFixed;
  exports.precisionPrefix = precisionPrefix;
  exports.precisionRound = precisionRound;

}));
},{}],58:[function(require,module,exports){
(function() {
    !function() {
        var d3 = {
            version: "3.4.4"
        };
        d3.geo = {};
        function d3_noop() {}
        function d3_adder() {}
        d3_adder.prototype = {
            s: 0,
            t: 0,
            add: function(y) {
                d3_adderSum(y, this.t, d3_adderTemp);
                d3_adderSum(d3_adderTemp.s, this.s, this);
                if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
            },
            reset: function() {
                this.s = this.t = 0;
            },
            valueOf: function() {
                return this.s;
            }
        };
        var d3_adderTemp = new d3_adder();
        function d3_adderSum(a, b, o) {
            var x = o.s = a + b, bv = x - a, av = x - bv;
            o.t = a - av + (b - bv);
        }
        var π = Math.PI, τ = 2 * π, halfπ = π / 2, ε = 1e-6, ε2 = ε * ε, d3_radians = π / 180, d3_degrees = 180 / π;
        function d3_sgn(x) {
            return x > 0 ? 1 : x < 0 ? -1 : 0;
        }
        function d3_cross2d(a, b, c) {
            return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        }
        function d3_acos(x) {
            return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
        }
        function d3_asin(x) {
            return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
        }
        function d3_sinh(x) {
            return ((x = Math.exp(x)) - 1 / x) / 2;
        }
        function d3_cosh(x) {
            return ((x = Math.exp(x)) + 1 / x) / 2;
        }
        function d3_tanh(x) {
            return ((x = Math.exp(2 * x)) - 1) / (x + 1);
        }
        function d3_haversin(x) {
            return (x = Math.sin(x / 2)) * x;
        }
        d3.geo.stream = function(object, listener) {
            if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
                d3_geo_streamObjectType[object.type](object, listener);
            } else {
                d3_geo_streamGeometry(object, listener);
            }
        };
        function d3_geo_streamGeometry(geometry, listener) {
            if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
                d3_geo_streamGeometryType[geometry.type](geometry, listener);
            }
        }
        var d3_geo_streamObjectType = {
            Feature: function(feature, listener) {
                d3_geo_streamGeometry(feature.geometry, listener);
            },
            FeatureCollection: function(object, listener) {
                var features = object.features, i = -1, n = features.length;
                while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
            }
        };
        var d3_geo_streamGeometryType = {
            Sphere: function(object, listener) {
                listener.sphere();
            },
            Point: function(object, listener) {
                object = object.coordinates;
                listener.point(object[0], object[1], object[2]);
            },
            MultiPoint: function(object, listener) {
                var coordinates = object.coordinates, i = -1, n = coordinates.length;
                while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
            },
            LineString: function(object, listener) {
                d3_geo_streamLine(object.coordinates, listener, 0);
            },
            MultiLineString: function(object, listener) {
                var coordinates = object.coordinates, i = -1, n = coordinates.length;
                while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
            },
            Polygon: function(object, listener) {
                d3_geo_streamPolygon(object.coordinates, listener);
            },
            MultiPolygon: function(object, listener) {
                var coordinates = object.coordinates, i = -1, n = coordinates.length;
                while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
            },
            GeometryCollection: function(object, listener) {
                var geometries = object.geometries, i = -1, n = geometries.length;
                while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
            }
        };
        function d3_geo_streamLine(coordinates, listener, closed) {
            var i = -1, n = coordinates.length - closed, coordinate;
            listener.lineStart();
            while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
            listener.lineEnd();
        }
        function d3_geo_streamPolygon(coordinates, listener) {
            var i = -1, n = coordinates.length;
            listener.polygonStart();
            while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
            listener.polygonEnd();
        }
        d3.geo.area = function(object) {
            d3_geo_areaSum = 0;
            d3.geo.stream(object, d3_geo_area);
            return d3_geo_areaSum;
        };
        var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
        var d3_geo_area = {
            sphere: function() {
                d3_geo_areaSum += 4 * π;
            },
            point: d3_noop,
            lineStart: d3_noop,
            lineEnd: d3_noop,
            polygonStart: function() {
                d3_geo_areaRingSum.reset();
                d3_geo_area.lineStart = d3_geo_areaRingStart;
            },
            polygonEnd: function() {
                var area = 2 * d3_geo_areaRingSum;
                d3_geo_areaSum += area < 0 ? 4 * π + area : area;
                d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
            }
        };
        function d3_geo_areaRingStart() {
            var λ00, φ00, λ0, cosφ0, sinφ0;
            d3_geo_area.point = function(λ, φ) {
                d3_geo_area.point = nextPoint;
                λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), 
                sinφ0 = Math.sin(φ);
            };
            function nextPoint(λ, φ) {
                λ *= d3_radians;
                φ = φ * d3_radians / 2 + π / 4;
                var dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(adλ), v = k * sdλ * Math.sin(adλ);
                d3_geo_areaRingSum.add(Math.atan2(v, u));
                λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
            }
            d3_geo_area.lineEnd = function() {
                nextPoint(λ00, φ00);
            };
        }
        var abs = Math.abs;
        function d3_geo_cartesian(spherical) {
            var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
            return [ cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ) ];
        }
        function d3_geo_cartesianDot(a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        }
        function d3_geo_cartesianCross(a, b) {
            return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
        }
        function d3_geo_cartesianAdd(a, b) {
            a[0] += b[0];
            a[1] += b[1];
            a[2] += b[2];
        }
        function d3_geo_cartesianScale(vector, k) {
            return [ vector[0] * k, vector[1] * k, vector[2] * k ];
        }
        function d3_geo_cartesianNormalize(d) {
            var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
            d[0] /= l;
            d[1] /= l;
            d[2] /= l;
        }
        function d3_geo_spherical(cartesian) {
            return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
        }
        function d3_geo_sphericalEqual(a, b) {
            return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
        }
        d3.geo.bounds = function() {
            var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
            var bound = {
                point: point,
                lineStart: lineStart,
                lineEnd: lineEnd,
                polygonStart: function() {
                    bound.point = ringPoint;
                    bound.lineStart = ringStart;
                    bound.lineEnd = ringEnd;
                    dλSum = 0;
                    d3_geo_area.polygonStart();
                },
                polygonEnd: function() {
                    d3_geo_area.polygonEnd();
                    bound.point = point;
                    bound.lineStart = lineStart;
                    bound.lineEnd = lineEnd;
                    if (d3_geo_areaRingSum < 0) λ0 = -(λ1 = 180), φ0 = -(φ1 = 90); else if (dλSum > ε) φ1 = 90; else if (dλSum < -ε) φ0 = -90;
                    range[0] = λ0, range[1] = λ1;
                }
            };
            function point(λ, φ) {
                ranges.push(range = [ λ0 = λ, λ1 = λ ]);
                if (φ < φ0) φ0 = φ;
                if (φ > φ1) φ1 = φ;
            }
            function linePoint(λ, φ) {
                var p = d3_geo_cartesian([ λ * d3_radians, φ * d3_radians ]);
                if (p0) {
                    var normal = d3_geo_cartesianCross(p0, p), equatorial = [ normal[1], -normal[0], 0 ], inflection = d3_geo_cartesianCross(equatorial, normal);
                    d3_geo_cartesianNormalize(inflection);
                    inflection = d3_geo_spherical(inflection);
                    var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s, antimeridian = abs(dλ) > 180;
                    if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
                        var φi = inflection[1] * d3_degrees;
                        if (φi > φ1) φ1 = φi;
                    } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
                        var φi = -inflection[1] * d3_degrees;
                        if (φi < φ0) φ0 = φi;
                    } else {
                        if (φ < φ0) φ0 = φ;
                        if (φ > φ1) φ1 = φ;
                    }
                    if (antimeridian) {
                        if (λ < λ_) {
                            if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
                        } else {
                            if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
                        }
                    } else {
                        if (λ1 >= λ0) {
                            if (λ < λ0) λ0 = λ;
                            if (λ > λ1) λ1 = λ;
                        } else {
                            if (λ > λ_) {
                                if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
                            } else {
                                if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
                            }
                        }
                    }
                } else {
                    point(λ, φ);
                }
                p0 = p, λ_ = λ;
            }
            function lineStart() {
                bound.point = linePoint;
            }
            function lineEnd() {
                range[0] = λ0, range[1] = λ1;
                bound.point = point;
                p0 = null;
            }
            function ringPoint(λ, φ) {
                if (p0) {
                    var dλ = λ - λ_;
                    dλSum += abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
                } else λ__ = λ, φ__ = φ;
                d3_geo_area.point(λ, φ);
                linePoint(λ, φ);
            }
            function ringStart() {
                d3_geo_area.lineStart();
            }
            function ringEnd() {
                ringPoint(λ__, φ__);
                d3_geo_area.lineEnd();
                if (abs(dλSum) > ε) λ0 = -(λ1 = 180);
                range[0] = λ0, range[1] = λ1;
                p0 = null;
            }
            function angle(λ0, λ1) {
                return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
            }
            function compareRanges(a, b) {
                return a[0] - b[0];
            }
            function withinRange(x, range) {
                return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
            }
            return function(feature) {
                φ1 = λ1 = -(λ0 = φ0 = Infinity);
                ranges = [];
                d3.geo.stream(feature, bound);
                var n = ranges.length;
                if (n) {
                    ranges.sort(compareRanges);
                    for (var i = 1, a = ranges[0], b, merged = [ a ]; i < n; ++i) {
                        b = ranges[i];
                        if (withinRange(b[0], a) || withinRange(b[1], a)) {
                            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
                            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
                        } else {
                            merged.push(a = b);
                        }
                    }
                    var best = -Infinity, dλ;
                    for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
                        b = merged[i];
                        if ((dλ = angle(a[1], b[0])) > best) best = dλ, λ0 = b[0], λ1 = a[1];
                    }
                }
                ranges = range = null;
                return λ0 === Infinity || φ0 === Infinity ? [ [ NaN, NaN ], [ NaN, NaN ] ] : [ [ λ0, φ0 ], [ λ1, φ1 ] ];
            };
        }();
        d3.geo.centroid = function(object) {
            d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
            d3.geo.stream(object, d3_geo_centroid);
            var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
            if (m < ε2) {
                x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
                if (d3_geo_centroidW1 < ε) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
                m = x * x + y * y + z * z;
                if (m < ε2) return [ NaN, NaN ];
            }
            return [ Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees ];
        };
        var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
        var d3_geo_centroid = {
            sphere: d3_noop,
            point: d3_geo_centroidPoint,
            lineStart: d3_geo_centroidLineStart,
            lineEnd: d3_geo_centroidLineEnd,
            polygonStart: function() {
                d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
            },
            polygonEnd: function() {
                d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
            }
        };
        function d3_geo_centroidPoint(λ, φ) {
            λ *= d3_radians;
            var cosφ = Math.cos(φ *= d3_radians);
            d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
        }
        function d3_geo_centroidPointXYZ(x, y, z) {
            ++d3_geo_centroidW0;
            d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
            d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
            d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
        }
        function d3_geo_centroidLineStart() {
            var x0, y0, z0;
            d3_geo_centroid.point = function(λ, φ) {
                λ *= d3_radians;
                var cosφ = Math.cos(φ *= d3_radians);
                x0 = cosφ * Math.cos(λ);
                y0 = cosφ * Math.sin(λ);
                z0 = Math.sin(φ);
                d3_geo_centroid.point = nextPoint;
                d3_geo_centroidPointXYZ(x0, y0, z0);
            };
            function nextPoint(λ, φ) {
                λ *= d3_radians;
                var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
                d3_geo_centroidW1 += w;
                d3_geo_centroidX1 += w * (x0 + (x0 = x));
                d3_geo_centroidY1 += w * (y0 + (y0 = y));
                d3_geo_centroidZ1 += w * (z0 + (z0 = z));
                d3_geo_centroidPointXYZ(x0, y0, z0);
            }
        }
        function d3_geo_centroidLineEnd() {
            d3_geo_centroid.point = d3_geo_centroidPoint;
        }
        function d3_geo_centroidRingStart() {
            var λ00, φ00, x0, y0, z0;
            d3_geo_centroid.point = function(λ, φ) {
                λ00 = λ, φ00 = φ;
                d3_geo_centroid.point = nextPoint;
                λ *= d3_radians;
                var cosφ = Math.cos(φ *= d3_radians);
                x0 = cosφ * Math.cos(λ);
                y0 = cosφ * Math.sin(λ);
                z0 = Math.sin(φ);
                d3_geo_centroidPointXYZ(x0, y0, z0);
            };
            d3_geo_centroid.lineEnd = function() {
                nextPoint(λ00, φ00);
                d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
                d3_geo_centroid.point = d3_geo_centroidPoint;
            };
            function nextPoint(λ, φ) {
                λ *= d3_radians;
                var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
                d3_geo_centroidX2 += v * cx;
                d3_geo_centroidY2 += v * cy;
                d3_geo_centroidZ2 += v * cz;
                d3_geo_centroidW1 += w;
                d3_geo_centroidX1 += w * (x0 + (x0 = x));
                d3_geo_centroidY1 += w * (y0 + (y0 = y));
                d3_geo_centroidZ1 += w * (z0 + (z0 = z));
                d3_geo_centroidPointXYZ(x0, y0, z0);
            }
        }
        function d3_identity(d) {
            return d;
        }
        d3.rebind = function(target, source) {
            var i = 1, n = arguments.length, method;
            while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
            return target;
        };
        function d3_rebind(target, source, method) {
            return function() {
                var value = method.apply(source, arguments);
                return value === source ? target : value;
            };
        }
        function d3_true() {
            return true;
        }
        d3.merge = function(arrays) {
            var n = arrays.length, m, i = -1, j = 0, merged, array;
            while (++i < n) j += arrays[i].length;
            merged = new Array(j);
            while (--n >= 0) {
                array = arrays[n];
                m = array.length;
                while (--m >= 0) {
                    merged[--j] = array[m];
                }
            }
            return merged;
        };
        function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
            var subject = [], clip = [];
            segments.forEach(function(segment) {
                if ((n = segment.length - 1) <= 0) return;
                var n, p0 = segment[0], p1 = segment[n];
                if (d3_geo_sphericalEqual(p0, p1)) {
                    listener.lineStart();
                    for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
                    listener.lineEnd();
                    return;
                }
                var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
                a.o = b;
                subject.push(a);
                clip.push(b);
                a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
                b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
                a.o = b;
                subject.push(a);
                clip.push(b);
            });
            clip.sort(compare);
            d3_geo_clipPolygonLinkCircular(subject);
            d3_geo_clipPolygonLinkCircular(clip);
            if (!subject.length) return;
            for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
                clip[i].e = entry = !entry;
            }
            var start = subject[0], points, point;
            while (1) {
                var current = start, isSubject = true;
                while (current.v) if ((current = current.n) === start) return;
                points = current.z;
                listener.lineStart();
                do {
                    current.v = current.o.v = true;
                    if (current.e) {
                        if (isSubject) {
                            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
                        } else {
                            interpolate(current.x, current.n.x, 1, listener);
                        }
                        current = current.n;
                    } else {
                        if (isSubject) {
                            points = current.p.z;
                            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
                        } else {
                            interpolate(current.x, current.p.x, -1, listener);
                        }
                        current = current.p;
                    }
                    current = current.o;
                    points = current.z;
                    isSubject = !isSubject;
                } while (!current.v);
                listener.lineEnd();
            }
        }
        function d3_geo_clipPolygonLinkCircular(array) {
            if (!(n = array.length)) return;
            var n, i = 0, a = array[0], b;
            while (++i < n) {
                a.n = b = array[i];
                b.p = a;
                a = b;
            }
            a.n = b = array[0];
            b.p = a;
        }
        function d3_geo_clipPolygonIntersection(point, points, other, entry) {
            this.x = point;
            this.z = points;
            this.o = other;
            this.e = entry;
            this.v = false;
            this.n = this.p = null;
        }
        function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
            return function(rotate, listener) {
                var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
                var clip = {
                    point: point,
                    lineStart: lineStart,
                    lineEnd: lineEnd,
                    polygonStart: function() {
                        clip.point = pointRing;
                        clip.lineStart = ringStart;
                        clip.lineEnd = ringEnd;
                        segments = [];
                        polygon = [];
                        listener.polygonStart();
                    },
                    polygonEnd: function() {
                        clip.point = point;
                        clip.lineStart = lineStart;
                        clip.lineEnd = lineEnd;
                        segments = d3.merge(segments);
                        var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
                        if (segments.length) {
                            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
                        } else if (clipStartInside) {
                            listener.lineStart();
                            interpolate(null, null, 1, listener);
                            listener.lineEnd();
                        }
                        listener.polygonEnd();
                        segments = polygon = null;
                    },
                    sphere: function() {
                        listener.polygonStart();
                        listener.lineStart();
                        interpolate(null, null, 1, listener);
                        listener.lineEnd();
                        listener.polygonEnd();
                    }
                };
                function point(λ, φ) {
                    var point = rotate(λ, φ);
                    if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
                }
                function pointLine(λ, φ) {
                    var point = rotate(λ, φ);
                    line.point(point[0], point[1]);
                }
                function lineStart() {
                    clip.point = pointLine;
                    line.lineStart();
                }
                function lineEnd() {
                    clip.point = point;
                    line.lineEnd();
                }
                var segments;
                var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygon, ring;
                function pointRing(λ, φ) {
                    ring.push([ λ, φ ]);
                    var point = rotate(λ, φ);
                    ringListener.point(point[0], point[1]);
                }
                function ringStart() {
                    ringListener.lineStart();
                    ring = [];
                }
                function ringEnd() {
                    pointRing(ring[0][0], ring[0][1]);
                    ringListener.lineEnd();
                    var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
                    ring.pop();
                    polygon.push(ring);
                    ring = null;
                    if (!n) return;
                    if (clean & 1) {
                        segment = ringSegments[0];
                        var n = segment.length - 1, i = -1, point;
                        listener.lineStart();
                        while (++i < n) listener.point((point = segment[i])[0], point[1]);
                        listener.lineEnd();
                        return;
                    }
                    if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
                    segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
                }
                return clip;
            };
        }
        function d3_geo_clipSegmentLength1(segment) {
            return segment.length > 1;
        }
        function d3_geo_clipBufferListener() {
            var lines = [], line;
            return {
                lineStart: function() {
                    lines.push(line = []);
                },
                point: function(λ, φ) {
                    line.push([ λ, φ ]);
                },
                lineEnd: d3_noop,
                buffer: function() {
                    var buffer = lines;
                    lines = [];
                    line = null;
                    return buffer;
                },
                rejoin: function() {
                    if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
                }
            };
        }
        function d3_geo_clipSort(a, b) {
            return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
        }
        function d3_geo_pointInPolygon(point, polygon) {
            var meridian = point[0], parallel = point[1], meridianNormal = [ Math.sin(meridian), -Math.cos(meridian), 0 ], polarAngle = 0, winding = 0;
            d3_geo_areaRingSum.reset();
            for (var i = 0, n = polygon.length; i < n; ++i) {
                var ring = polygon[i], m = ring.length;
                if (!m) continue;
                var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), j = 1;
                while (true) {
                    if (j === m) j = 0;
                    point = ring[j];
                    var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, antimeridian = adλ > π, k = sinφ0 * sinφ;
                    d3_geo_areaRingSum.add(Math.atan2(k * sdλ * Math.sin(adλ), cosφ0 * cosφ + k * Math.cos(adλ)));
                    polarAngle += antimeridian ? dλ + sdλ * τ : dλ;
                    if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
                        var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
                        d3_geo_cartesianNormalize(arc);
                        var intersection = d3_geo_cartesianCross(meridianNormal, arc);
                        d3_geo_cartesianNormalize(intersection);
                        var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
                        if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
                            winding += antimeridian ^ dλ >= 0 ? 1 : -1;
                        }
                    }
                    if (!j++) break;
                    λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
                }
            }
            return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < 0) ^ winding & 1;
        }
        var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [ -π, -π / 2 ]);
        function d3_geo_clipAntimeridianLine(listener) {
            var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
            return {
                lineStart: function() {
                    listener.lineStart();
                    clean = 1;
                },
                point: function(λ1, φ1) {
                    var sλ1 = λ1 > 0 ? π : -π, dλ = abs(λ1 - λ0);
                    if (abs(dλ - π) < ε) {
                        listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
                        listener.point(sλ0, φ0);
                        listener.lineEnd();
                        listener.lineStart();
                        listener.point(sλ1, φ0);
                        listener.point(λ1, φ0);
                        clean = 0;
                    } else if (sλ0 !== sλ1 && dλ >= π) {
                        if (abs(λ0 - sλ0) < ε) λ0 -= sλ0 * ε;
                        if (abs(λ1 - sλ1) < ε) λ1 -= sλ1 * ε;
                        φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
                        listener.point(sλ0, φ0);
                        listener.lineEnd();
                        listener.lineStart();
                        listener.point(sλ1, φ0);
                        clean = 0;
                    }
                    listener.point(λ0 = λ1, φ0 = φ1);
                    sλ0 = sλ1;
                },
                lineEnd: function() {
                    listener.lineEnd();
                    λ0 = φ0 = NaN;
                },
                clean: function() {
                    return 2 - clean;
                }
            };
        }
        function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
            var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
            return abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
        }
        function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
            var φ;
            if (from == null) {
                φ = direction * halfπ;
                listener.point(-π, φ);
                listener.point(0, φ);
                listener.point(π, φ);
                listener.point(π, 0);
                listener.point(π, -φ);
                listener.point(0, -φ);
                listener.point(-π, -φ);
                listener.point(-π, 0);
                listener.point(-π, φ);
            } else if (abs(from[0] - to[0]) > ε) {
                var s = from[0] < to[0] ? π : -π;
                φ = direction * s / 2;
                listener.point(-s, φ);
                listener.point(0, φ);
                listener.point(s, φ);
            } else {
                listener.point(to[0], to[1]);
            }
        }
        function d3_geo_clipCircle(radius) {
            var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ε, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
            return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [ 0, -radius ] : [ -π, radius - π ]);
            function visible(λ, φ) {
                return Math.cos(λ) * Math.cos(φ) > cr;
            }
            function clipLine(listener) {
                var point0, c0, v0, v00, clean;
                return {
                    lineStart: function() {
                        v00 = v0 = false;
                        clean = 1;
                    },
                    point: function(λ, φ) {
                        var point1 = [ λ, φ ], point2, v = visible(λ, φ), c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
                        if (!point0 && (v00 = v0 = v)) listener.lineStart();
                        if (v !== v0) {
                            point2 = intersect(point0, point1);
                            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
                                point1[0] += ε;
                                point1[1] += ε;
                                v = visible(point1[0], point1[1]);
                            }
                        }
                        if (v !== v0) {
                            clean = 0;
                            if (v) {
                                listener.lineStart();
                                point2 = intersect(point1, point0);
                                listener.point(point2[0], point2[1]);
                            } else {
                                point2 = intersect(point0, point1);
                                listener.point(point2[0], point2[1]);
                                listener.lineEnd();
                            }
                            point0 = point2;
                        } else if (notHemisphere && point0 && smallRadius ^ v) {
                            var t;
                            if (!(c & c0) && (t = intersect(point1, point0, true))) {
                                clean = 0;
                                if (smallRadius) {
                                    listener.lineStart();
                                    listener.point(t[0][0], t[0][1]);
                                    listener.point(t[1][0], t[1][1]);
                                    listener.lineEnd();
                                } else {
                                    listener.point(t[1][0], t[1][1]);
                                    listener.lineEnd();
                                    listener.lineStart();
                                    listener.point(t[0][0], t[0][1]);
                                }
                            }
                        }
                        if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
                            listener.point(point1[0], point1[1]);
                        }
                        point0 = point1, v0 = v, c0 = c;
                    },
                    lineEnd: function() {
                        if (v0) listener.lineEnd();
                        point0 = null;
                    },
                    clean: function() {
                        return clean | (v00 && v0) << 1;
                    }
                };
            }
            function intersect(a, b, two) {
                var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
                var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
                if (!determinant) return !two && a;
                var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
                d3_geo_cartesianAdd(A, B);
                var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
                if (t2 < 0) return;
                var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
                d3_geo_cartesianAdd(q, A);
                q = d3_geo_spherical(q);
                if (!two) return q;
                var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
                if (λ1 < λ0) z = λ0, λ0 = λ1, λ1 = z;
                var δλ = λ1 - λ0, polar = abs(δλ - π) < ε, meridian = polar || δλ < ε;
                if (!polar && φ1 < φ0) z = φ0, φ0 = φ1, φ1 = z;
                if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
                    var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
                    d3_geo_cartesianAdd(q1, A);
                    return [ q, d3_geo_spherical(q1) ];
                }
            }
            function code(λ, φ) {
                var r = smallRadius ? radius : π - radius, code = 0;
                if (λ < -r) code |= 1; else if (λ > r) code |= 2;
                if (φ < -r) code |= 4; else if (φ > r) code |= 8;
                return code;
            }
        }
        function d3_geom_clipLine(x0, y0, x1, y1) {
            return function(line) {
                var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
                r = x0 - ax;
                if (!dx && r > 0) return;
                r /= dx;
                if (dx < 0) {
                    if (r < t0) return;
                    if (r < t1) t1 = r;
                } else if (dx > 0) {
                    if (r > t1) return;
                    if (r > t0) t0 = r;
                }
                r = x1 - ax;
                if (!dx && r < 0) return;
                r /= dx;
                if (dx < 0) {
                    if (r > t1) return;
                    if (r > t0) t0 = r;
                } else if (dx > 0) {
                    if (r < t0) return;
                    if (r < t1) t1 = r;
                }
                r = y0 - ay;
                if (!dy && r > 0) return;
                r /= dy;
                if (dy < 0) {
                    if (r < t0) return;
                    if (r < t1) t1 = r;
                } else if (dy > 0) {
                    if (r > t1) return;
                    if (r > t0) t0 = r;
                }
                r = y1 - ay;
                if (!dy && r < 0) return;
                r /= dy;
                if (dy < 0) {
                    if (r > t1) return;
                    if (r > t0) t0 = r;
                } else if (dy > 0) {
                    if (r < t0) return;
                    if (r < t1) t1 = r;
                }
                if (t0 > 0) line.a = {
                    x: ax + t0 * dx,
                    y: ay + t0 * dy
                };
                if (t1 < 1) line.b = {
                    x: ax + t1 * dx,
                    y: ay + t1 * dy
                };
                return line;
            };
        }
        var d3_geo_clipExtentMAX = 1e9;
        d3.geo.clipExtent = function() {
            var x0, y0, x1, y1, stream, clip, clipExtent = {
                stream: function(output) {
                    if (stream) stream.valid = false;
                    stream = clip(output);
                    stream.valid = true;
                    return stream;
                },
                extent: function(_) {
                    if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
                    clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
                    if (stream) stream.valid = false, stream = null;
                    return clipExtent;
                }
            };
            return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
        };
        function d3_geo_clipExtent(x0, y0, x1, y1) {
            return function(listener) {
                var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
                var clip = {
                    point: point,
                    lineStart: lineStart,
                    lineEnd: lineEnd,
                    polygonStart: function() {
                        listener = bufferListener;
                        segments = [];
                        polygon = [];
                        clean = true;
                    },
                    polygonEnd: function() {
                        listener = listener_;
                        segments = d3.merge(segments);
                        var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
                        if (inside || visible) {
                            listener.polygonStart();
                            if (inside) {
                                listener.lineStart();
                                interpolate(null, null, 1, listener);
                                listener.lineEnd();
                            }
                            if (visible) {
                                d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
                            }
                            listener.polygonEnd();
                        }
                        segments = polygon = ring = null;
                    }
                };
                function insidePolygon(p) {
                    var wn = 0, n = polygon.length, y = p[1];
                    for (var i = 0; i < n; ++i) {
                        for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
                            b = v[j];
                            if (a[1] <= y) {
                                if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
                            } else {
                                if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
                            }
                            a = b;
                        }
                    }
                    return wn !== 0;
                }
                function interpolate(from, to, direction, listener) {
                    var a = 0, a1 = 0;
                    if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
                        do {
                            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
                        } while ((a = (a + direction + 4) % 4) !== a1);
                    } else {
                        listener.point(to[0], to[1]);
                    }
                }
                function pointVisible(x, y) {
                    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
                }
                function point(x, y) {
                    if (pointVisible(x, y)) listener.point(x, y);
                }
                var x__, y__, v__, x_, y_, v_, first, clean;
                function lineStart() {
                    clip.point = linePoint;
                    if (polygon) polygon.push(ring = []);
                    first = true;
                    v_ = false;
                    x_ = y_ = NaN;
                }
                function lineEnd() {
                    if (segments) {
                        linePoint(x__, y__);
                        if (v__ && v_) bufferListener.rejoin();
                        segments.push(bufferListener.buffer());
                    }
                    clip.point = point;
                    if (v_) listener.lineEnd();
                }
                function linePoint(x, y) {
                    x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
                    y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
                    var v = pointVisible(x, y);
                    if (polygon) ring.push([ x, y ]);
                    if (first) {
                        x__ = x, y__ = y, v__ = v;
                        first = false;
                        if (v) {
                            listener.lineStart();
                            listener.point(x, y);
                        }
                    } else {
                        if (v && v_) listener.point(x, y); else {
                            var l = {
                                a: {
                                    x: x_,
                                    y: y_
                                },
                                b: {
                                    x: x,
                                    y: y
                                }
                            };
                            if (clipLine(l)) {
                                if (!v_) {
                                    listener.lineStart();
                                    listener.point(l.a.x, l.a.y);
                                }
                                listener.point(l.b.x, l.b.y);
                                if (!v) listener.lineEnd();
                                clean = false;
                            } else if (v) {
                                listener.lineStart();
                                listener.point(x, y);
                                clean = false;
                            }
                        }
                    }
                    x_ = x, y_ = y, v_ = v;
                }
                return clip;
            };
            function corner(p, direction) {
                return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
            }
            function compare(a, b) {
                return comparePoints(a.x, b.x);
            }
            function comparePoints(a, b) {
                var ca = corner(a, 1), cb = corner(b, 1);
                return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
            }
        }
        function d3_geo_compose(a, b) {
            function compose(x, y) {
                return x = a(x, y), b(x[0], x[1]);
            }
            if (a.invert && b.invert) compose.invert = function(x, y) {
                return x = b.invert(x, y), x && a.invert(x[0], x[1]);
            };
            return compose;
        }
        function d3_geo_conic(projectAt) {
            var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
            p.parallels = function(_) {
                if (!arguments.length) return [ φ0 / π * 180, φ1 / π * 180 ];
                return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
            };
            return p;
        }
        function d3_geo_conicEqualArea(φ0, φ1) {
            var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
            function forward(λ, φ) {
                var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
                return [ ρ * Math.sin(λ *= n), ρ0 - ρ * Math.cos(λ) ];
            }
            forward.invert = function(x, y) {
                var ρ0_y = ρ0 - y;
                return [ Math.atan2(x, ρ0_y) / n, d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n)) ];
            };
            return forward;
        }
        (d3.geo.conicEqualArea = function() {
            return d3_geo_conic(d3_geo_conicEqualArea);
        }).raw = d3_geo_conicEqualArea;
        d3.geo.albers = function() {
            return d3.geo.conicEqualArea().rotate([ 96, 0 ]).center([ -.6, 38.7 ]).parallels([ 29.5, 45.5 ]).scale(1070);
        };
        d3.geo.albersUsa = function() {
            var lower48 = d3.geo.albers();
            var alaska = d3.geo.conicEqualArea().rotate([ 154, 0 ]).center([ -2, 58.5 ]).parallels([ 55, 65 ]);
            var hawaii = d3.geo.conicEqualArea().rotate([ 157, 0 ]).center([ -3, 19.9 ]).parallels([ 8, 18 ]);
            var point, pointStream = {
                point: function(x, y) {
                    point = [ x, y ];
                }
            }, lower48Point, alaskaPoint, hawaiiPoint;
            function albersUsa(coordinates) {
                var x = coordinates[0], y = coordinates[1];
                point = null;
                (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
                return point;
            }
            albersUsa.invert = function(coordinates) {
                var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
                return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
            };
            albersUsa.stream = function(stream) {
                var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
                return {
                    point: function(x, y) {
                        lower48Stream.point(x, y);
                        alaskaStream.point(x, y);
                        hawaiiStream.point(x, y);
                    },
                    sphere: function() {
                        lower48Stream.sphere();
                        alaskaStream.sphere();
                        hawaiiStream.sphere();
                    },
                    lineStart: function() {
                        lower48Stream.lineStart();
                        alaskaStream.lineStart();
                        hawaiiStream.lineStart();
                    },
                    lineEnd: function() {
                        lower48Stream.lineEnd();
                        alaskaStream.lineEnd();
                        hawaiiStream.lineEnd();
                    },
                    polygonStart: function() {
                        lower48Stream.polygonStart();
                        alaskaStream.polygonStart();
                        hawaiiStream.polygonStart();
                    },
                    polygonEnd: function() {
                        lower48Stream.polygonEnd();
                        alaskaStream.polygonEnd();
                        hawaiiStream.polygonEnd();
                    }
                };
            };
            albersUsa.precision = function(_) {
                if (!arguments.length) return lower48.precision();
                lower48.precision(_);
                alaska.precision(_);
                hawaii.precision(_);
                return albersUsa;
            };
            albersUsa.scale = function(_) {
                if (!arguments.length) return lower48.scale();
                lower48.scale(_);
                alaska.scale(_ * .35);
                hawaii.scale(_);
                return albersUsa.translate(lower48.translate());
            };
            albersUsa.translate = function(_) {
                if (!arguments.length) return lower48.translate();
                var k = lower48.scale(), x = +_[0], y = +_[1];
                lower48Point = lower48.translate(_).clipExtent([ [ x - .455 * k, y - .238 * k ], [ x + .455 * k, y + .238 * k ] ]).stream(pointStream).point;
                alaskaPoint = alaska.translate([ x - .307 * k, y + .201 * k ]).clipExtent([ [ x - .425 * k + ε, y + .12 * k + ε ], [ x - .214 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
                hawaiiPoint = hawaii.translate([ x - .205 * k, y + .212 * k ]).clipExtent([ [ x - .214 * k + ε, y + .166 * k + ε ], [ x - .115 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
                return albersUsa;
            };
            return albersUsa.scale(1070);
        };
        var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
            point: d3_noop,
            lineStart: d3_noop,
            lineEnd: d3_noop,
            polygonStart: function() {
                d3_geo_pathAreaPolygon = 0;
                d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
            },
            polygonEnd: function() {
                d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
                d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
            }
        };
        function d3_geo_pathAreaRingStart() {
            var x00, y00, x0, y0;
            d3_geo_pathArea.point = function(x, y) {
                d3_geo_pathArea.point = nextPoint;
                x00 = x0 = x, y00 = y0 = y;
            };
            function nextPoint(x, y) {
                d3_geo_pathAreaPolygon += y0 * x - x0 * y;
                x0 = x, y0 = y;
            }
            d3_geo_pathArea.lineEnd = function() {
                nextPoint(x00, y00);
            };
        }
        var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
        var d3_geo_pathBounds = {
            point: d3_geo_pathBoundsPoint,
            lineStart: d3_noop,
            lineEnd: d3_noop,
            polygonStart: d3_noop,
            polygonEnd: d3_noop
        };
        function d3_geo_pathBoundsPoint(x, y) {
            if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
            if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
            if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
            if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
        }
        function d3_geo_pathBuffer() {
            var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
            var stream = {
                point: point,
                lineStart: function() {
                    stream.point = pointLineStart;
                },
                lineEnd: lineEnd,
                polygonStart: function() {
                    stream.lineEnd = lineEndPolygon;
                },
                polygonEnd: function() {
                    stream.lineEnd = lineEnd;
                    stream.point = point;
                },
                pointRadius: function(_) {
                    pointCircle = d3_geo_pathBufferCircle(_);
                    return stream;
                },
                result: function() {
                    if (buffer.length) {
                        var result = buffer.join("");
                        buffer = [];
                        return result;
                    }
                }
            };
            function point(x, y) {
                buffer.push("M", x, ",", y, pointCircle);
            }
            function pointLineStart(x, y) {
                buffer.push("M", x, ",", y);
                stream.point = pointLine;
            }
            function pointLine(x, y) {
                buffer.push("L", x, ",", y);
            }
            function lineEnd() {
                stream.point = point;
            }
            function lineEndPolygon() {
                buffer.push("Z");
            }
            return stream;
        }
        function d3_geo_pathBufferCircle(radius) {
            return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
        }
        var d3_geo_pathCentroid = {
            point: d3_geo_pathCentroidPoint,
            lineStart: d3_geo_pathCentroidLineStart,
            lineEnd: d3_geo_pathCentroidLineEnd,
            polygonStart: function() {
                d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
            },
            polygonEnd: function() {
                d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
                d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
                d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
            }
        };
        function d3_geo_pathCentroidPoint(x, y) {
            d3_geo_centroidX0 += x;
            d3_geo_centroidY0 += y;
            ++d3_geo_centroidZ0;
        }
        function d3_geo_pathCentroidLineStart() {
            var x0, y0;
            d3_geo_pathCentroid.point = function(x, y) {
                d3_geo_pathCentroid.point = nextPoint;
                d3_geo_pathCentroidPoint(x0 = x, y0 = y);
            };
            function nextPoint(x, y) {
                var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
                d3_geo_centroidX1 += z * (x0 + x) / 2;
                d3_geo_centroidY1 += z * (y0 + y) / 2;
                d3_geo_centroidZ1 += z;
                d3_geo_pathCentroidPoint(x0 = x, y0 = y);
            }
        }
        function d3_geo_pathCentroidLineEnd() {
            d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
        }
        function d3_geo_pathCentroidRingStart() {
            var x00, y00, x0, y0;
            d3_geo_pathCentroid.point = function(x, y) {
                d3_geo_pathCentroid.point = nextPoint;
                d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
            };
            function nextPoint(x, y) {
                var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
                d3_geo_centroidX1 += z * (x0 + x) / 2;
                d3_geo_centroidY1 += z * (y0 + y) / 2;
                d3_geo_centroidZ1 += z;
                z = y0 * x - x0 * y;
                d3_geo_centroidX2 += z * (x0 + x);
                d3_geo_centroidY2 += z * (y0 + y);
                d3_geo_centroidZ2 += z * 3;
                d3_geo_pathCentroidPoint(x0 = x, y0 = y);
            }
            d3_geo_pathCentroid.lineEnd = function() {
                nextPoint(x00, y00);
            };
        }
        function d3_geo_pathContext(context) {
            var pointRadius = 4.5;
            var stream = {
                point: point,
                lineStart: function() {
                    stream.point = pointLineStart;
                },
                lineEnd: lineEnd,
                polygonStart: function() {
                    stream.lineEnd = lineEndPolygon;
                },
                polygonEnd: function() {
                    stream.lineEnd = lineEnd;
                    stream.point = point;
                },
                pointRadius: function(_) {
                    pointRadius = _;
                    return stream;
                },
                result: d3_noop
            };
            function point(x, y) {
                context.moveTo(x, y);
                context.arc(x, y, pointRadius, 0, τ);
            }
            function pointLineStart(x, y) {
                context.moveTo(x, y);
                stream.point = pointLine;
            }
            function pointLine(x, y) {
                context.lineTo(x, y);
            }
            function lineEnd() {
                stream.point = point;
            }
            function lineEndPolygon() {
                context.closePath();
            }
            return stream;
        }
        function d3_geo_resample(project) {
            var δ2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
            function resample(stream) {
                return (maxDepth ? resampleRecursive : resampleNone)(stream);
            }
            function resampleNone(stream) {
                return d3_geo_transformPoint(stream, function(x, y) {
                    x = project(x, y);
                    stream.point(x[0], x[1]);
                });
            }
            function resampleRecursive(stream) {
                var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
                var resample = {
                    point: point,
                    lineStart: lineStart,
                    lineEnd: lineEnd,
                    polygonStart: function() {
                        stream.polygonStart();
                        resample.lineStart = ringStart;
                    },
                    polygonEnd: function() {
                        stream.polygonEnd();
                        resample.lineStart = lineStart;
                    }
                };
                function point(x, y) {
                    x = project(x, y);
                    stream.point(x[0], x[1]);
                }
                function lineStart() {
                    x0 = NaN;
                    resample.point = linePoint;
                    stream.lineStart();
                }
                function linePoint(λ, φ) {
                    var c = d3_geo_cartesian([ λ, φ ]), p = project(λ, φ);
                    resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
                    stream.point(x0, y0);
                }
                function lineEnd() {
                    resample.point = point;
                    stream.lineEnd();
                }
                function ringStart() {
                    lineStart();
                    resample.point = ringPoint;
                    resample.lineEnd = ringEnd;
                }
                function ringPoint(λ, φ) {
                    linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
                    resample.point = linePoint;
                }
                function ringEnd() {
                    resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
                    resample.lineEnd = lineEnd;
                    lineEnd();
                }
                return resample;
            }
            function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
                var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
                if (d2 > 4 * δ2 && depth--) {
                    var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = abs(abs(c) - 1) < ε || abs(λ0 - λ1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
                    if (dz * dz / d2 > δ2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
                        resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
                        stream.point(x2, y2);
                        resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
                    }
                }
            }
            resample.precision = function(_) {
                if (!arguments.length) return Math.sqrt(δ2);
                maxDepth = (δ2 = _ * _) > 0 && 16;
                return resample;
            };
            return resample;
        }
        d3.geo.path = function() {
            var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
            function path(object) {
                if (object) {
                    if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
                    if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
                    d3.geo.stream(object, cacheStream);
                }
                return contextStream.result();
            }
            path.area = function(object) {
                d3_geo_pathAreaSum = 0;
                d3.geo.stream(object, projectStream(d3_geo_pathArea));
                return d3_geo_pathAreaSum;
            };
            path.centroid = function(object) {
                d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
                d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
                return d3_geo_centroidZ2 ? [ d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2 ] : d3_geo_centroidZ1 ? [ d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1 ] : d3_geo_centroidZ0 ? [ d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0 ] : [ NaN, NaN ];
            };
            path.bounds = function(object) {
                d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
                d3.geo.stream(object, projectStream(d3_geo_pathBounds));
                return [ [ d3_geo_pathBoundsX0, d3_geo_pathBoundsY0 ], [ d3_geo_pathBoundsX1, d3_geo_pathBoundsY1 ] ];
            };
            path.projection = function(_) {
                if (!arguments.length) return projection;
                projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
                return reset();
            };
            path.context = function(_) {
                if (!arguments.length) return context;
                contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
                if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
                return reset();
            };
            path.pointRadius = function(_) {
                if (!arguments.length) return pointRadius;
                pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
                return path;
            };
            function reset() {
                cacheStream = null;
                return path;
            }
            return path.projection(d3.geo.albersUsa()).context(null);
        };
        function d3_geo_pathProjectStream(project) {
            var resample = d3_geo_resample(function(x, y) {
                return project([ x * d3_degrees, y * d3_degrees ]);
            });
            return function(stream) {
                return d3_geo_projectionRadians(resample(stream));
            };
        }
        var d3_arraySlice = [].slice, d3_array = function(list) {
            return d3_arraySlice.call(list);
        };
        d3.geo.transform = function(methods) {
            return {
                stream: function(stream) {
                    var transform = new d3_geo_transform(stream);
                    for (var k in methods) transform[k] = methods[k];
                    return transform;
                }
            };
        };
        function d3_geo_transform(stream) {
            this.stream = stream;
        }
        d3_geo_transform.prototype = {
            point: function(x, y) {
                this.stream.point(x, y);
            },
            sphere: function() {
                this.stream.sphere();
            },
            lineStart: function() {
                this.stream.lineStart();
            },
            lineEnd: function() {
                this.stream.lineEnd();
            },
            polygonStart: function() {
                this.stream.polygonStart();
            },
            polygonEnd: function() {
                this.stream.polygonEnd();
            }
        };
        function d3_geo_transformPoint(stream, point) {
            return {
                point: point,
                sphere: function() {
                    stream.sphere();
                },
                lineStart: function() {
                    stream.lineStart();
                },
                lineEnd: function() {
                    stream.lineEnd();
                },
                polygonStart: function() {
                    stream.polygonStart();
                },
                polygonEnd: function() {
                    stream.polygonEnd();
                }
            };
        }
        d3.geo.projection = d3_geo_projection;
        d3.geo.projectionMutator = d3_geo_projectionMutator;
        function d3_geo_projection(project) {
            return d3_geo_projectionMutator(function() {
                return project;
            })();
        }
        function d3_geo_projectionMutator(projectAt) {
            var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
                x = project(x, y);
                return [ x[0] * k + δx, δy - x[1] * k ];
            }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
            function projection(point) {
                point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
                return [ point[0] * k + δx, δy - point[1] * k ];
            }
            function invert(point) {
                point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
                return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
            }
            projection.stream = function(output) {
                if (stream) stream.valid = false;
                stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
                stream.valid = true;
                return stream;
            };
            projection.clipAngle = function(_) {
                if (!arguments.length) return clipAngle;
                preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
                return invalidate();
            };
            projection.clipExtent = function(_) {
                if (!arguments.length) return clipExtent;
                clipExtent = _;
                postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
                return invalidate();
            };
            projection.scale = function(_) {
                if (!arguments.length) return k;
                k = +_;
                return reset();
            };
            projection.translate = function(_) {
                if (!arguments.length) return [ x, y ];
                x = +_[0];
                y = +_[1];
                return reset();
            };
            projection.center = function(_) {
                if (!arguments.length) return [ λ * d3_degrees, φ * d3_degrees ];
                λ = _[0] % 360 * d3_radians;
                φ = _[1] % 360 * d3_radians;
                return reset();
            };
            projection.rotate = function(_) {
                if (!arguments.length) return [ δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees ];
                δλ = _[0] % 360 * d3_radians;
                δφ = _[1] % 360 * d3_radians;
                δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
                return reset();
            };
            d3.rebind(projection, projectResample, "precision");
            function reset() {
                projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
                var center = project(λ, φ);
                δx = x - center[0] * k;
                δy = y + center[1] * k;
                return invalidate();
            }
            function invalidate() {
                if (stream) stream.valid = false, stream = null;
                return projection;
            }
            return function() {
                project = projectAt.apply(this, arguments);
                projection.invert = project.invert && invert;
                return reset();
            };
        }
        function d3_geo_projectionRadians(stream) {
            return d3_geo_transformPoint(stream, function(x, y) {
                stream.point(x * d3_radians, y * d3_radians);
            });
        }
        function d3_geo_equirectangular(λ, φ) {
            return [ λ, φ ];
        }
        (d3.geo.equirectangular = function() {
            return d3_geo_projection(d3_geo_equirectangular);
        }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
        d3.geo.rotation = function(rotate) {
            rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
            function forward(coordinates) {
                coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
                return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
            }
            forward.invert = function(coordinates) {
                coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
                return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
            };
            return forward;
        };
        function d3_geo_identityRotation(λ, φ) {
            return [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
        }
        d3_geo_identityRotation.invert = d3_geo_equirectangular;
        function d3_geo_rotation(δλ, δφ, δγ) {
            return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
        }
        function d3_geo_forwardRotationλ(δλ) {
            return function(λ, φ) {
                return λ += δλ, [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
            };
        }
        function d3_geo_rotationλ(δλ) {
            var rotation = d3_geo_forwardRotationλ(δλ);
            rotation.invert = d3_geo_forwardRotationλ(-δλ);
            return rotation;
        }
        function d3_geo_rotationφγ(δφ, δγ) {
            var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
            function rotation(λ, φ) {
                var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
                return [ Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), d3_asin(k * cosδγ + y * sinδγ) ];
            }
            rotation.invert = function(λ, φ) {
                var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
                return [ Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), d3_asin(k * cosδφ - x * sinδφ) ];
            };
            return rotation;
        }
        d3.geo.circle = function() {
            var origin = [ 0, 0 ], angle, precision = 6, interpolate;
            function circle() {
                var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
                interpolate(null, null, 1, {
                    point: function(x, y) {
                        ring.push(x = rotate(x, y));
                        x[0] *= d3_degrees, x[1] *= d3_degrees;
                    }
                });
                return {
                    type: "Polygon",
                    coordinates: [ ring ]
                };
            }
            circle.origin = function(x) {
                if (!arguments.length) return origin;
                origin = x;
                return circle;
            };
            circle.angle = function(x) {
                if (!arguments.length) return angle;
                interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
                return circle;
            };
            circle.precision = function(_) {
                if (!arguments.length) return precision;
                interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
                return circle;
            };
            return circle.angle(90);
        };
        function d3_geo_circleInterpolate(radius, precision) {
            var cr = Math.cos(radius), sr = Math.sin(radius);
            return function(from, to, direction, listener) {
                var step = direction * precision;
                if (from != null) {
                    from = d3_geo_circleAngle(cr, from);
                    to = d3_geo_circleAngle(cr, to);
                    if (direction > 0 ? from < to : from > to) from += direction * τ;
                } else {
                    from = radius + direction * τ;
                    to = radius - .5 * step;
                }
                for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
                    listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
                }
            };
        }
        function d3_geo_circleAngle(cr, point) {
            var a = d3_geo_cartesian(point);
            a[0] -= cr;
            d3_geo_cartesianNormalize(a);
            var angle = d3_acos(-a[1]);
            return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
        }
        d3.geo.distance = function(a, b) {
            var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians, sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
            return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
        };
        d3.range = function(start, stop, step) {
            if (arguments.length < 3) {
                step = 1;
                if (arguments.length < 2) {
                    stop = start;
                    start = 0;
                }
            }
            if ((stop - start) / step === Infinity) throw new Error("infinite range");
            var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
            start *= k, stop *= k, step *= k;
            if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
            return range;
        };
        function d3_range_integerScale(x) {
            var k = 1;
            while (x * k % 1) k *= 10;
            return k;
        }
        d3.geo.graticule = function() {
            var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
            function graticule() {
                return {
                    type: "MultiLineString",
                    coordinates: lines()
                };
            }
            function lines() {
                return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
                    return abs(x % DX) > ε;
                }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
                    return abs(y % DY) > ε;
                }).map(y));
            }
            graticule.lines = function() {
                return lines().map(function(coordinates) {
                    return {
                        type: "LineString",
                        coordinates: coordinates
                    };
                });
            };
            graticule.outline = function() {
                return {
                    type: "Polygon",
                    coordinates: [ X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1)) ]
                };
            };
            graticule.extent = function(_) {
                if (!arguments.length) return graticule.minorExtent();
                return graticule.majorExtent(_).minorExtent(_);
            };
            graticule.majorExtent = function(_) {
                if (!arguments.length) return [ [ X0, Y0 ], [ X1, Y1 ] ];
                X0 = +_[0][0], X1 = +_[1][0];
                Y0 = +_[0][1], Y1 = +_[1][1];
                if (X0 > X1) _ = X0, X0 = X1, X1 = _;
                if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
                return graticule.precision(precision);
            };
            graticule.minorExtent = function(_) {
                if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
                x0 = +_[0][0], x1 = +_[1][0];
                y0 = +_[0][1], y1 = +_[1][1];
                if (x0 > x1) _ = x0, x0 = x1, x1 = _;
                if (y0 > y1) _ = y0, y0 = y1, y1 = _;
                return graticule.precision(precision);
            };
            graticule.step = function(_) {
                if (!arguments.length) return graticule.minorStep();
                return graticule.majorStep(_).minorStep(_);
            };
            graticule.majorStep = function(_) {
                if (!arguments.length) return [ DX, DY ];
                DX = +_[0], DY = +_[1];
                return graticule;
            };
            graticule.minorStep = function(_) {
                if (!arguments.length) return [ dx, dy ];
                dx = +_[0], dy = +_[1];
                return graticule;
            };
            graticule.precision = function(_) {
                if (!arguments.length) return precision;
                precision = +_;
                x = d3_geo_graticuleX(y0, y1, 90);
                y = d3_geo_graticuleY(x0, x1, precision);
                X = d3_geo_graticuleX(Y0, Y1, 90);
                Y = d3_geo_graticuleY(X0, X1, precision);
                return graticule;
            };
            return graticule.majorExtent([ [ -180, -90 + ε ], [ 180, 90 - ε ] ]).minorExtent([ [ -180, -80 - ε ], [ 180, 80 + ε ] ]);
        };
        function d3_geo_graticuleX(y0, y1, dy) {
            var y = d3.range(y0, y1 - ε, dy).concat(y1);
            return function(x) {
                return y.map(function(y) {
                    return [ x, y ];
                });
            };
        }
        function d3_geo_graticuleY(x0, x1, dx) {
            var x = d3.range(x0, x1 - ε, dx).concat(x1);
            return function(y) {
                return x.map(function(x) {
                    return [ x, y ];
                });
            };
        }
        function d3_source(d) {
            return d.source;
        }
        function d3_target(d) {
            return d.target;
        }
        d3.geo.greatArc = function() {
            var source = d3_source, source_, target = d3_target, target_;
            function greatArc() {
                return {
                    type: "LineString",
                    coordinates: [ source_ || source.apply(this, arguments), target_ || target.apply(this, arguments) ]
                };
            }
            greatArc.distance = function() {
                return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
            };
            greatArc.source = function(_) {
                if (!arguments.length) return source;
                source = _, source_ = typeof _ === "function" ? null : _;
                return greatArc;
            };
            greatArc.target = function(_) {
                if (!arguments.length) return target;
                target = _, target_ = typeof _ === "function" ? null : _;
                return greatArc;
            };
            greatArc.precision = function() {
                return arguments.length ? greatArc : 0;
            };
            return greatArc;
        };
        d3.geo.interpolate = function(source, target) {
            return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
        };
        function d3_geo_interpolate(x0, y0, x1, y1) {
            var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
            var interpolate = d ? function(t) {
                var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
                return [ Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees ];
            } : function() {
                return [ x0 * d3_degrees, y0 * d3_degrees ];
            };
            interpolate.distance = d;
            return interpolate;
        }
        d3.geo.length = function(object) {
            d3_geo_lengthSum = 0;
            d3.geo.stream(object, d3_geo_length);
            return d3_geo_lengthSum;
        };
        var d3_geo_lengthSum;
        var d3_geo_length = {
            sphere: d3_noop,
            point: d3_noop,
            lineStart: d3_geo_lengthLineStart,
            lineEnd: d3_noop,
            polygonStart: d3_noop,
            polygonEnd: d3_noop
        };
        function d3_geo_lengthLineStart() {
            var λ0, sinφ0, cosφ0;
            d3_geo_length.point = function(λ, φ) {
                λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
                d3_geo_length.point = nextPoint;
            };
            d3_geo_length.lineEnd = function() {
                d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
            };
            function nextPoint(λ, φ) {
                var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = abs((λ *= d3_radians) - λ0), cosΔλ = Math.cos(t);
                d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
                λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
            }
        }
        function d3_geo_azimuthal(scale, angle) {
            function azimuthal(λ, φ) {
                var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
                return [ k * cosφ * Math.sin(λ), k * Math.sin(φ) ];
            }
            azimuthal.invert = function(x, y) {
                var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
                return [ Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ) ];
            };
            return azimuthal;
        }
        var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cosλcosφ) {
            return Math.sqrt(2 / (1 + cosλcosφ));
        }, function(ρ) {
            return 2 * Math.asin(ρ / 2);
        });
        (d3.geo.azimuthalEqualArea = function() {
            return d3_geo_projection(d3_geo_azimuthalEqualArea);
        }).raw = d3_geo_azimuthalEqualArea;
        var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(cosλcosφ) {
            var c = Math.acos(cosλcosφ);
            return c && c / Math.sin(c);
        }, d3_identity);
        (d3.geo.azimuthalEquidistant = function() {
            return d3_geo_projection(d3_geo_azimuthalEquidistant);
        }).raw = d3_geo_azimuthalEquidistant;
        function d3_geo_conicConformal(φ0, φ1) {
            var cosφ0 = Math.cos(φ0), t = function(φ) {
                return Math.tan(π / 4 + φ / 2);
            }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)), F = cosφ0 * Math.pow(t(φ0), n) / n;
            if (!n) return d3_geo_mercator;
            function forward(λ, φ) {
                if (F > 0) {
                    if (φ < -halfπ + ε) φ = -halfπ + ε;
                } else {
                    if (φ > halfπ - ε) φ = halfπ - ε;
                }
                var ρ = F / Math.pow(t(φ), n);
                return [ ρ * Math.sin(n * λ), F - ρ * Math.cos(n * λ) ];
            }
            forward.invert = function(x, y) {
                var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
                return [ Math.atan2(x, ρ0_y) / n, 2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ ];
            };
            return forward;
        }
        (d3.geo.conicConformal = function() {
            return d3_geo_conic(d3_geo_conicConformal);
        }).raw = d3_geo_conicConformal;
        function d3_geo_conicEquidistant(φ0, φ1) {
            var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0), G = cosφ0 / n + φ0;
            if (abs(n) < ε) return d3_geo_equirectangular;
            function forward(λ, φ) {
                var ρ = G - φ;
                return [ ρ * Math.sin(n * λ), G - ρ * Math.cos(n * λ) ];
            }
            forward.invert = function(x, y) {
                var ρ0_y = G - y;
                return [ Math.atan2(x, ρ0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y) ];
            };
            return forward;
        }
        (d3.geo.conicEquidistant = function() {
            return d3_geo_conic(d3_geo_conicEquidistant);
        }).raw = d3_geo_conicEquidistant;
        var d3_geo_gnomonic = d3_geo_azimuthal(function(cosλcosφ) {
            return 1 / cosλcosφ;
        }, Math.atan);
        (d3.geo.gnomonic = function() {
            return d3_geo_projection(d3_geo_gnomonic);
        }).raw = d3_geo_gnomonic;
        function d3_geo_mercator(λ, φ) {
            return [ λ, Math.log(Math.tan(π / 4 + φ / 2)) ];
        }
        d3_geo_mercator.invert = function(x, y) {
            return [ x, 2 * Math.atan(Math.exp(y)) - halfπ ];
        };
        function d3_geo_mercatorProjection(project) {
            var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
            m.scale = function() {
                var v = scale.apply(m, arguments);
                return v === m ? clipAuto ? m.clipExtent(null) : m : v;
            };
            m.translate = function() {
                var v = translate.apply(m, arguments);
                return v === m ? clipAuto ? m.clipExtent(null) : m : v;
            };
            m.clipExtent = function(_) {
                var v = clipExtent.apply(m, arguments);
                if (v === m) {
                    if (clipAuto = _ == null) {
                        var k = π * scale(), t = translate();
                        clipExtent([ [ t[0] - k, t[1] - k ], [ t[0] + k, t[1] + k ] ]);
                    }
                } else if (clipAuto) {
                    v = null;
                }
                return v;
            };
            return m.clipExtent(null);
        }
        (d3.geo.mercator = function() {
            return d3_geo_mercatorProjection(d3_geo_mercator);
        }).raw = d3_geo_mercator;
        var d3_geo_orthographic = d3_geo_azimuthal(function() {
            return 1;
        }, Math.asin);
        (d3.geo.orthographic = function() {
            return d3_geo_projection(d3_geo_orthographic);
        }).raw = d3_geo_orthographic;
        var d3_geo_stereographic = d3_geo_azimuthal(function(cosλcosφ) {
            return 1 / (1 + cosλcosφ);
        }, function(ρ) {
            return 2 * Math.atan(ρ);
        });
        (d3.geo.stereographic = function() {
            return d3_geo_projection(d3_geo_stereographic);
        }).raw = d3_geo_stereographic;
        function d3_geo_transverseMercator(λ, φ) {
            return [ Math.log(Math.tan(π / 4 + φ / 2)), -λ ];
        }
        d3_geo_transverseMercator.invert = function(x, y) {
            return [ -y, 2 * Math.atan(Math.exp(x)) - halfπ ];
        };
        (d3.geo.transverseMercator = function() {
            var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center, rotate = projection.rotate;
            projection.center = function(_) {
                return _ ? center([ -_[1], _[0] ]) : (_ = center(), [ -_[1], _[0] ]);
            };
            projection.rotate = function(_) {
                return _ ? rotate([ _[0], _[1], _.length > 2 ? _[2] + 90 : 90 ]) : (_ = rotate(), 
                [ _[0], _[1], _[2] - 90 ]);
            };
            return projection.rotate([ 0, 0 ]);
        }).raw = d3_geo_transverseMercator;
        if (typeof define === "function" && define.amd) {
            define(d3);
        } else if (typeof module === "object" && module.exports) {
            module.exports = d3;
        } else {
            this.d3 = d3;
        }
    }();
})();
},{}],59:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-color')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-color'], factory) :
  (factory((global.d3_interpolate = {}),global.d3_color));
}(this, function (exports,d3Color) { 'use strict';

  function constant(x) {
    return function() {
      return x;
    };
  }

  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function hue(a, b) {
    var d = b - a;
    return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant(isNaN(a) ? b : a);
  }

  var rgb$1 = (function gamma$$(y) {
    var interpolateColor = gamma(y);

    function interpolateRgb(start, end) {
      var r = interpolateColor((start = d3Color.rgb(start)).r, (end = d3Color.rgb(end)).r),
          g = interpolateColor(start.g, end.g),
          b = interpolateColor(start.b, end.b),
          opacity = interpolateColor(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    interpolateRgb.gamma = gamma$$;

    return interpolateRgb;
  })(1);

  // TODO sparse arrays?
  function array(a, b) {
    var x = [],
        c = [],
        na = a ? a.length : 0,
        nb = b ? b.length : 0,
        n0 = Math.min(na, nb),
        i;

    for (i = 0; i < n0; ++i) x.push(value(a[i], b[i]));
    for (; i < na; ++i) c[i] = a[i];
    for (; i < nb; ++i) c[i] = b[i];

    return function(t) {
      for (i = 0; i < n0; ++i) c[i] = x[i](t);
      return c;
    };
  }

  function number(a, b) {
    return a = +a, b -= a, function(t) {
      return a + b * t;
    };
  }

  function object(a, b) {
    var i = {},
        c = {},
        k;

    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};

    for (k in a) {
      if (k in b) {
        i[k] = value(a[k], b[k]);
      } else {
        c[k] = a[k];
      }
    }

    for (k in b) {
      if (!(k in a)) {
        c[k] = b[k];
      }
    }

    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function string(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: number(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  var values = [
    function(a, b) {
      var t = typeof b, c;
      return (t === "string" ? ((c = d3Color.color(b)) ? (b = c, rgb$1) : string)
          : b instanceof d3Color.color ? rgb$1
          : Array.isArray(b) ? array
          : t === "object" && isNaN(b) ? object
          : number)(a, b);
    }
  ];

  function value(a, b) {
    var i = values.length, f;
    while (--i >= 0 && !(f = values[i](a, b)));
    return f;
  }

  function round(a, b) {
    return a = +a, b -= a, function(t) {
      return Math.round(a + b * t);
    };
  }

  var rad2deg = 180 / Math.PI;
  var identity = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0};
  var g;
  // Compute x-scale and normalize the first row.
  // Compute shear and make second row orthogonal to first.
  // Compute y-scale and normalize the second row.
  // Finally, compute the rotation.
  function Transform(string) {
    if (!g) g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    if (string) g.setAttribute("transform", string), t = g.transform.baseVal.consolidate();

    var t,
        m = t ? t.matrix : identity,
        r0 = [m.a, m.b],
        r1 = [m.c, m.d],
        kx = normalize(r0),
        kz = dot(r0, r1),
        ky = normalize(combine(r1, r0, -kz)) || 0;

    if (r0[0] * r1[1] < r1[0] * r0[1]) {
      r0[0] *= -1;
      r0[1] *= -1;
      kx *= -1;
      kz *= -1;
    }

    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * rad2deg;
    this.translate = [m.e, m.f];
    this.scale = [kx, ky];
    this.skew = ky ? Math.atan2(kz, ky) * rad2deg : 0;
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

  function normalize(a) {
    var k = Math.sqrt(dot(a, a));
    if (k) a[0] /= k, a[1] /= k;
    return k;
  }

  function combine(a, b, k) {
    a[0] += k * b[0];
    a[1] += k * b[1];
    return a;
  }

  function pop(s) {
    return s.length ? s.pop() + "," : "";
  }

  function translate(ta, tb, s, q) {
    if (ta[0] !== tb[0] || ta[1] !== tb[1]) {
      var i = s.push("translate(", null, ",", null, ")");
      q.push({i: i - 4, x: number(ta[0], tb[0])}, {i: i - 2, x: number(ta[1], tb[1])});
    } else if (tb[0] || tb[1]) {
      s.push("translate(" + tb + ")");
    }
  }

  function rotate(ra, rb, s, q) {
    if (ra !== rb) {
      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360; // shortest path
      q.push({i: s.push(pop(s) + "rotate(", null, ")") - 2, x: number(ra, rb)});
    } else if (rb) {
      s.push(pop(s) + "rotate(" + rb + ")");
    }
  }

  function skew(wa, wb, s, q) {
    if (wa !== wb) {
      q.push({i: s.push(pop(s) + "skewX(", null, ")") - 2, x: number(wa, wb)});
    } else if (wb) {
      s.push(pop(s) + "skewX(" + wb + ")");
    }
  }

  function scale(ka, kb, s, q) {
    if (ka[0] !== kb[0] || ka[1] !== kb[1]) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({i: i - 4, x: number(ka[0], kb[0])}, {i: i - 2, x: number(ka[1], kb[1])});
    } else if (kb[0] !== 1 || kb[1] !== 1) {
      s.push(pop(s) + "scale(" + kb + ")");
    }
  }

  function transform(a, b) {
    var s = [], // string constants and placeholders
        q = []; // number interpolators
    a = new Transform(a), b = new Transform(b);
    translate(a.translate, b.translate, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skew(a.skew, b.skew, s, q);
    scale(a.scale, b.scale, s, q);
    a = b = null; // gc
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  }

  var rho = Math.SQRT2;
  var rho2 = 2;
  var rho4 = 4;
  var epsilon2 = 1e-12;
  function cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }

  function sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }

  function tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }

  // p0 = [ux0, uy0, w0]
  // p1 = [ux1, uy1, w1]
  function zoom(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
        ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
        dx = ux1 - ux0,
        dy = uy1 - uy0,
        d2 = dx * dx + dy * dy,
        i,
        S;

    // Special case for u0 ≅ u1.
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      }
    }

    // General case.
    else {
      var d1 = Math.sqrt(d2),
          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S,
            coshr0 = cosh(r0),
            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      }
    }

    i.duration = S * 1000;

    return i;
  }

  function interpolateHsl(start, end) {
    var h = hue((start = d3Color.hsl(start)).h, (end = d3Color.hsl(end)).h),
        s = nogamma(start.s, end.s),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.s = s(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  function interpolateHslLong(start, end) {
    var h = nogamma((start = d3Color.hsl(start)).h, (end = d3Color.hsl(end)).h),
        s = nogamma(start.s, end.s),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.s = s(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  function interpolateLab(start, end) {
    var l = nogamma((start = d3Color.lab(start)).l, (end = d3Color.lab(end)).l),
        a = nogamma(start.a, end.a),
        b = nogamma(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.l = l(t);
      start.a = a(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  function interpolateHcl(start, end) {
    var h = hue((start = d3Color.hcl(start)).h, (end = d3Color.hcl(end)).h),
        c = nogamma(start.c, end.c),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.c = c(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  function interpolateHclLong(start, end) {
    var h = nogamma((start = d3Color.hcl(start)).h, (end = d3Color.hcl(end)).h),
        c = nogamma(start.c, end.c),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.c = c(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  var cubehelix$1 = (function gamma(y) {
    y = +y;

    function interpolateCubehelix(start, end) {
      var h = hue((start = d3Color.cubehelix(start)).h, (end = d3Color.cubehelix(end)).h),
          s = nogamma(start.s, end.s),
          l = nogamma(start.l, end.l),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    interpolateCubehelix.gamma = gamma;

    return interpolateCubehelix;
  })(1);

  var cubehelixLong = (function gamma(y) {
    y = +y;

    function interpolateCubehelixLong(start, end) {
      var h = nogamma((start = d3Color.cubehelix(start)).h, (end = d3Color.cubehelix(end)).h),
          s = nogamma(start.s, end.s),
          l = nogamma(start.l, end.l),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    interpolateCubehelixLong.gamma = gamma;

    return interpolateCubehelixLong;
  })(1);

  var version = "0.5.2";

  exports.version = version;
  exports.interpolate = value;
  exports.interpolators = values;
  exports.interpolateArray = array;
  exports.interpolateNumber = number;
  exports.interpolateObject = object;
  exports.interpolateRound = round;
  exports.interpolateString = string;
  exports.interpolateTransform = transform;
  exports.interpolateZoom = zoom;
  exports.interpolateRgb = rgb$1;
  exports.interpolateHsl = interpolateHsl;
  exports.interpolateHslLong = interpolateHslLong;
  exports.interpolateLab = interpolateLab;
  exports.interpolateHcl = interpolateHcl;
  exports.interpolateHclLong = interpolateHclLong;
  exports.interpolateCubehelix = cubehelix$1;
  exports.interpolateCubehelixLong = cubehelixLong;

}));
},{"d3-color":56}],60:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-collection'), require('d3-interpolate'), require('d3-format'), require('d3-time'), require('d3-time-format'), require('d3-color')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-collection', 'd3-interpolate', 'd3-format', 'd3-time', 'd3-time-format', 'd3-color'], factory) :
  (factory((global.d3_scale = global.d3_scale || {}),global.d3_array,global.d3_collection,global.d3_interpolate,global.d3_format,global.d3_time,global.d3_time_format,global.d3_color));
}(this, function (exports,d3Array,d3Collection,d3Interpolate,d3Format,d3Time,d3TimeFormat,d3Color) { 'use strict';

  var array = Array.prototype;

  var map$1 = array.map;
  var slice = array.slice;

  var implicit = {name: "implicit"};

  function ordinal() {
    var index = d3Collection.map(),
        domain = [],
        range = [],
        unknown = implicit;

    function scale(d) {
      var key = d + "", i = index.get(key);
      if (!i) {
        if (unknown !== implicit) return unknown;
        index.set(key, i = domain.push(d));
      }
      return range[(i - 1) % range.length];
    }

    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [], index = d3Collection.map();
      var i = -1, n = _.length, d, key;
      while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
      return scale;
    };

    scale.range = function(_) {
      return arguments.length ? (range = slice.call(_), scale) : range.slice();
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    scale.copy = function() {
      return ordinal()
          .domain(domain)
          .range(range)
          .unknown(unknown);
    };

    return scale;
  }

  function band() {
    var scale = ordinal().unknown(undefined),
        domain = scale.domain,
        ordinalRange = scale.range,
        range = [0, 1],
        step,
        bandwidth,
        round = false,
        paddingInner = 0,
        paddingOuter = 0,
        align = 0.5;

    delete scale.unknown;

    function rescale() {
      var n = domain().length,
          reverse = range[1] < range[0],
          start = range[reverse - 0],
          stop = range[1 - reverse];
      step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
      if (round) step = Math.floor(step);
      start += (stop - start - step * (n - paddingInner)) * align;
      bandwidth = step * (1 - paddingInner);
      if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
      var values = d3Array.range(n).map(function(i) { return start + step * i; });
      return ordinalRange(reverse ? values.reverse() : values);
    }

    scale.domain = function(_) {
      return arguments.length ? (domain(_), rescale()) : domain();
    };

    scale.range = function(_) {
      return arguments.length ? (range = [+_[0], +_[1]], rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
      return range = [+_[0], +_[1]], round = true, rescale();
    };

    scale.bandwidth = function() {
      return bandwidth;
    };

    scale.step = function() {
      return step;
    };

    scale.round = function(_) {
      return arguments.length ? (round = !!_, rescale()) : round;
    };

    scale.padding = function(_) {
      return arguments.length ? (paddingInner = paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
    };

    scale.paddingInner = function(_) {
      return arguments.length ? (paddingInner = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
    };

    scale.paddingOuter = function(_) {
      return arguments.length ? (paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingOuter;
    };

    scale.align = function(_) {
      return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
    };

    scale.copy = function() {
      return band()
          .domain(domain())
          .range(range)
          .round(round)
          .paddingInner(paddingInner)
          .paddingOuter(paddingOuter)
          .align(align);
    };

    return rescale();
  }

  function pointish(scale) {
    var copy = scale.copy;

    scale.padding = scale.paddingOuter;
    delete scale.paddingInner;
    delete scale.paddingOuter;

    scale.copy = function() {
      return pointish(copy());
    };

    return scale;
  }

  function point() {
    return pointish(band().paddingInner(1));
  }

  function constant(x) {
    return function() {
      return x;
    };
  }

  function number(x) {
    return +x;
  }

  var unit = [0, 1];

  function deinterpolate(a, b) {
    return (b -= (a = +a))
        ? function(x) { return (x - a) / b; }
        : constant(b);
  }

  function deinterpolateClamp(deinterpolate) {
    return function(a, b) {
      var d = deinterpolate(a = +a, b = +b);
      return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
    };
  }

  function reinterpolateClamp(reinterpolate) {
    return function(a, b) {
      var r = reinterpolate(a = +a, b = +b);
      return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
    };
  }

  function bimap(domain, range, deinterpolate, reinterpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
    else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
    return function(x) { return r0(d0(x)); };
  }

  function polymap(domain, range, deinterpolate, reinterpolate) {
    var j = Math.min(domain.length, range.length) - 1,
        d = new Array(j),
        r = new Array(j),
        i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }

    while (++i < j) {
      d[i] = deinterpolate(domain[i], domain[i + 1]);
      r[i] = reinterpolate(range[i], range[i + 1]);
    }

    return function(x) {
      var i = d3Array.bisect(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }

  function copy(source, target) {
    return target
        .domain(source.domain())
        .range(source.range())
        .interpolate(source.interpolate())
        .clamp(source.clamp());
  }

  // deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
  function continuous(deinterpolate$$, reinterpolate) {
    var domain = unit,
        range = unit,
        interpolate = d3Interpolate.interpolate,
        clamp = false,
        output,
        input;

    function rescale() {
      var map = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
      output = map(domain, range, clamp ? deinterpolateClamp(deinterpolate$$) : deinterpolate$$, interpolate);
      input = map(range, domain, deinterpolate, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate);
      return scale;
    }

    function scale(x) {
      return output(+x);
    }

    scale.invert = function(y) {
      return input(+y);
    };

    scale.domain = function(_) {
      return arguments.length ? (domain = map$1.call(_, number), rescale()) : domain.slice();
    };

    scale.range = function(_) {
      return arguments.length ? (range = slice.call(_), rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
      return range = slice.call(_), interpolate = d3Interpolate.interpolateRound, rescale();
    };

    scale.clamp = function(_) {
      return arguments.length ? (clamp = !!_, rescale()) : clamp;
    };

    scale.interpolate = function(_) {
      return arguments.length ? (interpolate = _, rescale()) : interpolate;
    };

    return rescale();
  }

  function tickFormat(domain, count, specifier) {
    var start = domain[0],
        stop = domain[domain.length - 1],
        step = d3Array.tickStep(start, stop, count == null ? 10 : count),
        precision;
    specifier = d3Format.formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = d3Format.precisionPrefix(step, value))) specifier.precision = precision;
        return d3Format.formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = d3Format.precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = d3Format.precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return d3Format.format(specifier);
  }

  function linearish(scale) {
    var domain = scale.domain;

    scale.ticks = function(count) {
      var d = domain();
      return d3Array.ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = function(count, specifier) {
      return tickFormat(domain(), count, specifier);
    };

    scale.nice = function(count) {
      var d = domain(),
          i = d.length - 1,
          n = count == null ? 10 : count,
          start = d[0],
          stop = d[i],
          step = d3Array.tickStep(start, stop, n);

      if (step) {
        step = d3Array.tickStep(Math.floor(start / step) * step, Math.ceil(stop / step) * step, n);
        d[0] = Math.floor(start / step) * step;
        d[i] = Math.ceil(stop / step) * step;
        domain(d);
      }

      return scale;
    };

    return scale;
  }

  function linear() {
    var scale = continuous(deinterpolate, d3Interpolate.interpolateNumber);

    scale.copy = function() {
      return copy(scale, linear());
    };

    return linearish(scale);
  }

  function identity() {
    var domain = [0, 1];

    function scale(x) {
      return +x;
    }

    scale.invert = scale;

    scale.domain = scale.range = function(_) {
      return arguments.length ? (domain = map$1.call(_, number), scale) : domain.slice();
    };

    scale.copy = function() {
      return identity().domain(domain);
    };

    return linearish(scale);
  }

  function nice(domain, interval) {
    domain = domain.slice();

    var i0 = 0,
        i1 = domain.length - 1,
        x0 = domain[i0],
        x1 = domain[i1],
        t;

    if (x1 < x0) {
      t = i0, i0 = i1, i1 = t;
      t = x0, x0 = x1, x1 = t;
    }

    domain[i0] = interval.floor(x0);
    domain[i1] = interval.ceil(x1);
    return domain;
  }

  function deinterpolate$1(a, b) {
    return (b = Math.log(b / a))
        ? function(x) { return Math.log(x / a) / b; }
        : constant(b);
  }

  function reinterpolate(a, b) {
    return a < 0
        ? function(t) { return -Math.pow(-b, t) * Math.pow(-a, 1 - t); }
        : function(t) { return Math.pow(b, t) * Math.pow(a, 1 - t); };
  }

  function pow10(x) {
    return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
  }

  function powp(base) {
    return base === 10 ? pow10
        : base === Math.E ? Math.exp
        : function(x) { return Math.pow(base, x); };
  }

  function logp(base) {
    return base === Math.E ? Math.log
        : base === 10 && Math.log10
        || base === 2 && Math.log2
        || (base = Math.log(base), function(x) { return Math.log(x) / base; });
  }

  function reflect(f) {
    return function(x) {
      return -f(-x);
    };
  }

  function log() {
    var scale = continuous(deinterpolate$1, reinterpolate).domain([1, 10]),
        domain = scale.domain,
        base = 10,
        logs = logp(10),
        pows = powp(10);

    function rescale() {
      logs = logp(base), pows = powp(base);
      if (domain()[0] < 0) logs = reflect(logs), pows = reflect(pows);
      return scale;
    }

    scale.base = function(_) {
      return arguments.length ? (base = +_, rescale()) : base;
    };

    scale.domain = function(_) {
      return arguments.length ? (domain(_), rescale()) : domain();
    };

    scale.ticks = function(count) {
      var d = domain(),
          u = d[0],
          v = d[d.length - 1],
          r;

      if (r = v < u) i = u, u = v, v = i;

      var i = logs(u),
          j = logs(v),
          p,
          k,
          t,
          n = count == null ? 10 : +count,
          z = [];

      if (!(base % 1) && j - i < n) {
        i = Math.round(i) - 1, j = Math.round(j) + 1;
        if (u > 0) for (; i < j; ++i) {
          for (k = 1, p = pows(i); k < base; ++k) {
            t = p * k;
            if (t < u) continue;
            if (t > v) break;
            z.push(t);
          }
        } else for (; i < j; ++i) {
          for (k = base - 1, p = pows(i); k >= 1; --k) {
            t = p * k;
            if (t < u) continue;
            if (t > v) break;
            z.push(t);
          }
        }
        if (r) z.reverse();
      } else {
        z = d3Array.ticks(i, j, Math.min(j - i, n)).map(pows);
      }

      return z;
    };

    scale.tickFormat = function(count, specifier) {
      if (specifier == null) specifier = base === 10 ? ".0e" : ",";
      if (typeof specifier !== "function") specifier = d3Format.format(specifier);
      if (count === Infinity) return specifier;
      if (count == null) count = 10;
      var k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
      return function(d) {
        var i = d / pows(Math.round(logs(d)));
        if (i * base < base - 0.5) i *= base;
        return i <= k ? specifier(d) : "";
      };
    };

    scale.nice = function() {
      return domain(nice(domain(), {
        floor: function(x) { return pows(Math.floor(logs(x))); },
        ceil: function(x) { return pows(Math.ceil(logs(x))); }
      }));
    };

    scale.copy = function() {
      return copy(scale, log().base(base));
    };

    return scale;
  }

  function raise(x, exponent) {
    return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
  }

  function pow() {
    var exponent = 1,
        scale = continuous(deinterpolate, reinterpolate),
        domain = scale.domain;

    function deinterpolate(a, b) {
      return (b = raise(b, exponent) - (a = raise(a, exponent)))
          ? function(x) { return (raise(x, exponent) - a) / b; }
          : constant(b);
    }

    function reinterpolate(a, b) {
      b = raise(b, exponent) - (a = raise(a, exponent));
      return function(t) { return raise(a + b * t, 1 / exponent); };
    }

    scale.exponent = function(_) {
      return arguments.length ? (exponent = +_, domain(domain())) : exponent;
    };

    scale.copy = function() {
      return copy(scale, pow().exponent(exponent));
    };

    return linearish(scale);
  }

  function sqrt() {
    return pow().exponent(0.5);
  }

  function quantile$1() {
    var domain = [],
        range = [],
        thresholds = [];

    function rescale() {
      var i = 0, n = Math.max(1, range.length);
      thresholds = new Array(n - 1);
      while (++i < n) thresholds[i - 1] = d3Array.quantile(domain, i / n);
      return scale;
    }

    function scale(x) {
      if (!isNaN(x = +x)) return range[d3Array.bisect(thresholds, x)];
    }

    scale.invertExtent = function(y) {
      var i = range.indexOf(y);
      return i < 0 ? [NaN, NaN] : [
        i > 0 ? thresholds[i - 1] : domain[0],
        i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
      ];
    };

    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [];
      for (var i = 0, n = _.length, d; i < n; ++i) if (d = _[i], d != null && !isNaN(d = +d)) domain.push(d);
      domain.sort(d3Array.ascending);
      return rescale();
    };

    scale.range = function(_) {
      return arguments.length ? (range = slice.call(_), rescale()) : range.slice();
    };

    scale.quantiles = function() {
      return thresholds.slice();
    };

    scale.copy = function() {
      return quantile$1()
          .domain(domain)
          .range(range);
    };

    return scale;
  }

  function quantize() {
    var x0 = 0,
        x1 = 1,
        n = 1,
        domain = [0.5],
        range = [0, 1];

    function scale(x) {
      if (x <= x) return range[d3Array.bisect(domain, x, 0, n)];
    }

    function rescale() {
      var i = -1;
      domain = new Array(n);
      while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
      return scale;
    }

    scale.domain = function(_) {
      return arguments.length ? (x0 = +_[0], x1 = +_[1], rescale()) : [x0, x1];
    };

    scale.range = function(_) {
      return arguments.length ? (n = (range = slice.call(_)).length - 1, rescale()) : range.slice();
    };

    scale.invertExtent = function(y) {
      var i = range.indexOf(y);
      return i < 0 ? [NaN, NaN]
          : i < 1 ? [x0, domain[0]]
          : i >= n ? [domain[n - 1], x1]
          : [domain[i - 1], domain[i]];
    };

    scale.copy = function() {
      return quantize()
          .domain([x0, x1])
          .range(range);
    };

    return linearish(scale);
  }

  function threshold() {
    var domain = [0.5],
        range = [0, 1],
        n = 1;

    function scale(x) {
      if (x <= x) return range[d3Array.bisect(domain, x, 0, n)];
    }

    scale.domain = function(_) {
      return arguments.length ? (domain = slice.call(_), n = Math.min(domain.length, range.length - 1), scale) : domain.slice();
    };

    scale.range = function(_) {
      return arguments.length ? (range = slice.call(_), n = Math.min(domain.length, range.length - 1), scale) : range.slice();
    };

    scale.invertExtent = function(y) {
      var i = range.indexOf(y);
      return [domain[i - 1], domain[i]];
    };

    scale.copy = function() {
      return threshold()
          .domain(domain)
          .range(range);
    };

    return scale;
  }

  var durationSecond = 1000;
  var durationMinute = durationSecond * 60;
  var durationHour = durationMinute * 60;
  var durationDay = durationHour * 24;
  var durationWeek = durationDay * 7;
  var durationMonth = durationDay * 30;
  var durationYear = durationDay * 365;
  function newDate(t) {
    return new Date(t);
  }

  function calendar(year, month, week, day, hour, minute, second, millisecond, format) {
    var scale = continuous(deinterpolate, d3Interpolate.interpolateNumber),
        invert = scale.invert,
        domain = scale.domain;

    var formatMillisecond = format(".%L"),
        formatSecond = format(":%S"),
        formatMinute = format("%I:%M"),
        formatHour = format("%I %p"),
        formatDay = format("%a %d"),
        formatWeek = format("%b %d"),
        formatMonth = format("%B"),
        formatYear = format("%Y");

    var tickIntervals = [
      [second,  1,      durationSecond],
      [second,  5,  5 * durationSecond],
      [second, 15, 15 * durationSecond],
      [second, 30, 30 * durationSecond],
      [minute,  1,      durationMinute],
      [minute,  5,  5 * durationMinute],
      [minute, 15, 15 * durationMinute],
      [minute, 30, 30 * durationMinute],
      [  hour,  1,      durationHour  ],
      [  hour,  3,  3 * durationHour  ],
      [  hour,  6,  6 * durationHour  ],
      [  hour, 12, 12 * durationHour  ],
      [   day,  1,      durationDay   ],
      [   day,  2,  2 * durationDay   ],
      [  week,  1,      durationWeek  ],
      [ month,  1,      durationMonth ],
      [ month,  3,  3 * durationMonth ],
      [  year,  1,      durationYear  ]
    ];

    function tickFormat(date) {
      return (second(date) < date ? formatMillisecond
          : minute(date) < date ? formatSecond
          : hour(date) < date ? formatMinute
          : day(date) < date ? formatHour
          : month(date) < date ? (week(date) < date ? formatDay : formatWeek)
          : year(date) < date ? formatMonth
          : formatYear)(date);
    }

    function tickInterval(interval, start, stop, step) {
      if (interval == null) interval = 10;

      // If a desired tick count is specified, pick a reasonable tick interval
      // based on the extent of the domain and a rough estimate of tick size.
      // Otherwise, assume interval is already a time interval and use it.
      if (typeof interval === "number") {
        var target = Math.abs(stop - start) / interval,
            i = d3Array.bisector(function(i) { return i[2]; }).right(tickIntervals, target);
        if (i === tickIntervals.length) {
          step = d3Array.tickStep(start / durationYear, stop / durationYear, interval);
          interval = year;
        } else if (i) {
          i = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
          step = i[1];
          interval = i[0];
        } else {
          step = d3Array.tickStep(start, stop, interval);
          interval = millisecond;
        }
      }

      return step == null ? interval : interval.every(step);
    }

    scale.invert = function(y) {
      return new Date(invert(y));
    };

    scale.domain = function(_) {
      return arguments.length ? domain(_) : domain().map(newDate);
    };

    scale.ticks = function(interval, step) {
      var d = domain(),
          t0 = d[0],
          t1 = d[d.length - 1],
          r = t1 < t0,
          t;
      if (r) t = t0, t0 = t1, t1 = t;
      t = tickInterval(interval, t0, t1, step);
      t = t ? t.range(t0, t1 + 1) : []; // inclusive stop
      return r ? t.reverse() : t;
    };

    scale.tickFormat = function(specifier) {
      return specifier == null ? tickFormat : format(specifier);
    };

    scale.nice = function(interval, step) {
      var d = domain();
      return (interval = tickInterval(interval, d[0], d[d.length - 1], step))
          ? domain(nice(d, interval))
          : scale;
    };

    scale.copy = function() {
      return copy(scale, calendar(year, month, week, day, hour, minute, second, millisecond, format));
    };

    return scale;
  }

  function time() {
    return calendar(d3Time.timeYear, d3Time.timeMonth, d3Time.timeWeek, d3Time.timeDay, d3Time.timeHour, d3Time.timeMinute, d3Time.timeSecond, d3Time.timeMillisecond, d3TimeFormat.timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]);
  }

  function utcTime() {
    return calendar(d3Time.utcYear, d3Time.utcMonth, d3Time.utcWeek, d3Time.utcDay, d3Time.utcHour, d3Time.utcMinute, d3Time.utcSecond, d3Time.utcMillisecond, d3TimeFormat.utcFormat).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]);
  }

  function colors(s) {
    return s.match(/.{6}/g).map(function(x) {
      return "#" + x;
    });
  }

  var colors10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

  function category10() {
    return ordinal().range(colors10);
  }

  var colors20b = colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

  function category20b() {
    return ordinal().range(colors20b);
  }

  var colors20c = colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

  function category20c() {
    return ordinal().range(colors20c);
  }

  var colors20 = colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

  function category20() {
    return ordinal().range(colors20);
  }

  function cubehelix$1() {
    return linear()
        .interpolate(d3Interpolate.interpolateCubehelixLong)
        .range([d3Color.cubehelix(300, 0.5, 0.0), d3Color.cubehelix(-240, 0.5, 1.0)]);
  }

  function sequential(interpolate) {
    var x0 = 0,
        x1 = 1,
        clamp = false;

    function scale(x) {
      var t = (x - x0) / (x1 - x0);
      return interpolate(clamp ? Math.max(0, Math.min(1, t)) : t);
    }

    scale.domain = function(_) {
      return arguments.length ? (x0 = +_[0], x1 = +_[1], scale) : [x0, x1];
    };

    scale.clamp = function(_) {
      return arguments.length ? (clamp = !!_, scale) : clamp;
    };

    scale.copy = function() {
      return sequential(interpolate).domain([x0, x1]).clamp(clamp);
    };

    return linearish(scale);
  }

  function warm() {
    return sequential(d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(-100, 0.75, 0.35), d3Color.cubehelix(80, 1.50, 0.8)));
  }

  function cool() {
    return sequential(d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(260, 0.75, 0.35), d3Color.cubehelix(80, 1.50, 0.8)));
  }

  function rainbow() {
    var rainbow = d3Color.cubehelix();
    return sequential(function(t) {
      if (t < 0 || t > 1) t -= Math.floor(t);
      var ts = Math.abs(t - 0.5);
      rainbow.h = 360 * t - 100;
      rainbow.s = 1.5 - 1.5 * ts;
      rainbow.l = 0.8 - 0.9 * ts;
      return rainbow + "";
    });
  }

  var rangeViridis = colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725");
  var rangeMagma = colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf");
  var rangeInferno = colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4");
  var rangePlasma = colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921");
  function ramp(range) {
    var s = sequential(function(t) { return range[Math.round(t * range.length - t)]; }).clamp(true);
    delete s.clamp;
    return s;
  }

  function viridis() {
    return ramp(rangeViridis);
  }

  function magma() {
    return ramp(rangeMagma);
  }

  function inferno() {
    return ramp(rangeInferno);
  }

  function plasma() {
    return ramp(rangePlasma);
  }

  var version = "0.6.2";

  exports.version = version;
  exports.scaleBand = band;
  exports.scalePoint = point;
  exports.scaleIdentity = identity;
  exports.scaleLinear = linear;
  exports.scaleLog = log;
  exports.scaleOrdinal = ordinal;
  exports.scaleImplicit = implicit;
  exports.scalePow = pow;
  exports.scaleSqrt = sqrt;
  exports.scaleQuantile = quantile$1;
  exports.scaleQuantize = quantize;
  exports.scaleThreshold = threshold;
  exports.scaleTime = time;
  exports.scaleUtc = utcTime;
  exports.scaleCategory10 = category10;
  exports.scaleCategory20b = category20b;
  exports.scaleCategory20c = category20c;
  exports.scaleCategory20 = category20;
  exports.scaleCubehelix = cubehelix$1;
  exports.scaleRainbow = rainbow;
  exports.scaleWarm = warm;
  exports.scaleCool = cool;
  exports.scaleViridis = viridis;
  exports.scaleMagma = magma;
  exports.scaleInferno = inferno;
  exports.scalePlasma = plasma;

}));
},{"d3-array":54,"d3-collection":55,"d3-color":56,"d3-format":57,"d3-interpolate":59,"d3-time":62,"d3-time-format":61}],61:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-time')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-time'], factory) :
  (factory((global.d3_time_format = {}),global.d3_time));
}(this, function (exports,d3Time) { 'use strict';

  function localDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
      date.setFullYear(d.y);
      return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
  }

  function utcDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
      date.setUTCFullYear(d.y);
      return date;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
  }

  function newYear(y) {
    return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
  }

  function locale$1(locale) {
    var locale_dateTime = locale.dateTime,
        locale_date = locale.date,
        locale_time = locale.time,
        locale_periods = locale.periods,
        locale_weekdays = locale.days,
        locale_shortWeekdays = locale.shortDays,
        locale_months = locale.months,
        locale_shortMonths = locale.shortMonths;

    var periodRe = formatRe(locale_periods),
        periodLookup = formatLookup(locale_periods),
        weekdayRe = formatRe(locale_weekdays),
        weekdayLookup = formatLookup(locale_weekdays),
        shortWeekdayRe = formatRe(locale_shortWeekdays),
        shortWeekdayLookup = formatLookup(locale_shortWeekdays),
        monthRe = formatRe(locale_months),
        monthLookup = formatLookup(locale_months),
        shortMonthRe = formatRe(locale_shortMonths),
        shortMonthLookup = formatLookup(locale_shortMonths);

    var formats = {
      "a": formatShortWeekday,
      "A": formatWeekday,
      "b": formatShortMonth,
      "B": formatMonth,
      "c": null,
      "d": formatDayOfMonth,
      "e": formatDayOfMonth,
      "H": formatHour24,
      "I": formatHour12,
      "j": formatDayOfYear,
      "L": formatMilliseconds,
      "m": formatMonthNumber,
      "M": formatMinutes,
      "p": formatPeriod,
      "S": formatSeconds,
      "U": formatWeekNumberSunday,
      "w": formatWeekdayNumber,
      "W": formatWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatYear,
      "Y": formatFullYear,
      "Z": formatZone,
      "%": formatLiteralPercent
    };

    var utcFormats = {
      "a": formatUTCShortWeekday,
      "A": formatUTCWeekday,
      "b": formatUTCShortMonth,
      "B": formatUTCMonth,
      "c": null,
      "d": formatUTCDayOfMonth,
      "e": formatUTCDayOfMonth,
      "H": formatUTCHour24,
      "I": formatUTCHour12,
      "j": formatUTCDayOfYear,
      "L": formatUTCMilliseconds,
      "m": formatUTCMonthNumber,
      "M": formatUTCMinutes,
      "p": formatUTCPeriod,
      "S": formatUTCSeconds,
      "U": formatUTCWeekNumberSunday,
      "w": formatUTCWeekdayNumber,
      "W": formatUTCWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatUTCYear,
      "Y": formatUTCFullYear,
      "Z": formatUTCZone,
      "%": formatLiteralPercent
    };

    var parses = {
      "a": parseShortWeekday,
      "A": parseWeekday,
      "b": parseShortMonth,
      "B": parseMonth,
      "c": parseLocaleDateTime,
      "d": parseDayOfMonth,
      "e": parseDayOfMonth,
      "H": parseHour24,
      "I": parseHour24,
      "j": parseDayOfYear,
      "L": parseMilliseconds,
      "m": parseMonthNumber,
      "M": parseMinutes,
      "p": parsePeriod,
      "S": parseSeconds,
      "U": parseWeekNumberSunday,
      "w": parseWeekdayNumber,
      "W": parseWeekNumberMonday,
      "x": parseLocaleDate,
      "X": parseLocaleTime,
      "y": parseYear,
      "Y": parseFullYear,
      "Z": parseZone,
      "%": parseLiteralPercent
    };

    // These recursive directive definitions must be deferred.
    formats.x = newFormat(locale_date, formats);
    formats.X = newFormat(locale_time, formats);
    formats.c = newFormat(locale_dateTime, formats);
    utcFormats.x = newFormat(locale_date, utcFormats);
    utcFormats.X = newFormat(locale_time, utcFormats);
    utcFormats.c = newFormat(locale_dateTime, utcFormats);

    function newFormat(specifier, formats) {
      return function(date) {
        var string = [],
            i = -1,
            j = 0,
            n = specifier.length,
            c,
            pad,
            format;

        if (!(date instanceof Date)) date = new Date(+date);

        while (++i < n) {
          if (specifier.charCodeAt(i) === 37) {
            string.push(specifier.slice(j, i));
            if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
            else pad = c === "e" ? " " : "0";
            if (format = formats[c]) c = format(date, pad);
            string.push(c);
            j = i + 1;
          }
        }

        string.push(specifier.slice(j, i));
        return string.join("");
      };
    }

    function newParse(specifier, newDate) {
      return function(string) {
        var d = newYear(1900),
            i = parseSpecifier(d, specifier, string += "", 0);
        if (i != string.length) return null;

        // The am-pm flag is 0 for AM, and 1 for PM.
        if ("p" in d) d.H = d.H % 12 + d.p * 12;

        // Convert day-of-week and week-of-year to day-of-year.
        if ("W" in d || "U" in d) {
          if (!("w" in d)) d.w = "W" in d ? 1 : 0;
          var day = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
          d.m = 0;
          d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
        }

        // If a time zone is specified, all fields are interpreted as UTC and then
        // offset according to the specified time zone.
        if ("Z" in d) {
          d.H += d.Z / 100 | 0;
          d.M += d.Z % 100;
          return utcDate(d);
        }

        // Otherwise, all fields are in local time.
        return newDate(d);
      };
    }

    function parseSpecifier(d, specifier, string, j) {
      var i = 0,
          n = specifier.length,
          m = string.length,
          c,
          parse;

      while (i < n) {
        if (j >= m) return -1;
        c = specifier.charCodeAt(i++);
        if (c === 37) {
          c = specifier.charAt(i++);
          parse = parses[c in pads ? specifier.charAt(i++) : c];
          if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }

      return j;
    }

    function parsePeriod(d, string, i) {
      var n = periodRe.exec(string.slice(i));
      return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseShortWeekday(d, string, i) {
      var n = shortWeekdayRe.exec(string.slice(i));
      return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseWeekday(d, string, i) {
      var n = weekdayRe.exec(string.slice(i));
      return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseShortMonth(d, string, i) {
      var n = shortMonthRe.exec(string.slice(i));
      return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseMonth(d, string, i) {
      var n = monthRe.exec(string.slice(i));
      return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }

    function parseLocaleDateTime(d, string, i) {
      return parseSpecifier(d, locale_dateTime, string, i);
    }

    function parseLocaleDate(d, string, i) {
      return parseSpecifier(d, locale_date, string, i);
    }

    function parseLocaleTime(d, string, i) {
      return parseSpecifier(d, locale_time, string, i);
    }

    function formatShortWeekday(d) {
      return locale_shortWeekdays[d.getDay()];
    }

    function formatWeekday(d) {
      return locale_weekdays[d.getDay()];
    }

    function formatShortMonth(d) {
      return locale_shortMonths[d.getMonth()];
    }

    function formatMonth(d) {
      return locale_months[d.getMonth()];
    }

    function formatPeriod(d) {
      return locale_periods[+(d.getHours() >= 12)];
    }

    function formatUTCShortWeekday(d) {
      return locale_shortWeekdays[d.getUTCDay()];
    }

    function formatUTCWeekday(d) {
      return locale_weekdays[d.getUTCDay()];
    }

    function formatUTCShortMonth(d) {
      return locale_shortMonths[d.getUTCMonth()];
    }

    function formatUTCMonth(d) {
      return locale_months[d.getUTCMonth()];
    }

    function formatUTCPeriod(d) {
      return locale_periods[+(d.getUTCHours() >= 12)];
    }

    return {
      format: function(specifier) {
        var f = newFormat(specifier += "", formats);
        f.toString = function() { return specifier; };
        return f;
      },
      parse: function(specifier) {
        var p = newParse(specifier += "", localDate);
        p.toString = function() { return specifier; };
        return p;
      },
      utcFormat: function(specifier) {
        var f = newFormat(specifier += "", utcFormats);
        f.toString = function() { return specifier; };
        return f;
      },
      utcParse: function(specifier) {
        var p = newParse(specifier, utcDate);
        p.toString = function() { return specifier; };
        return p;
      }
    };
  }

  var pads = {"-": "", "_": " ", "0": "0"};
  var numberRe = /^\s*\d+/;
  var percentRe = /^%/;
  var requoteRe = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
  function pad(value, fill, width) {
    var sign = value < 0 ? "-" : "",
        string = (sign ? -value : value) + "",
        length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }

  function requote(s) {
    return s.replace(requoteRe, "\\$&");
  }

  function formatRe(names) {
    return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
  }

  function formatLookup(names) {
    var map = {}, i = -1, n = names.length;
    while (++i < n) map[names[i].toLowerCase()] = i;
    return map;
  }

  function parseWeekdayNumber(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.w = +n[0], i + n[0].length) : -1;
  }

  function parseWeekNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.U = +n[0], i + n[0].length) : -1;
  }

  function parseWeekNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.W = +n[0], i + n[0].length) : -1;
  }

  function parseFullYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 4));
    return n ? (d.y = +n[0], i + n[0].length) : -1;
  }

  function parseYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
  }

  function parseZone(d, string, i) {
    var n = /^(Z)|([+-]\d\d)(?:\:?(\d\d))?/.exec(string.slice(i, i + 6));
    return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
  }

  function parseMonthNumber(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
  }

  function parseDayOfMonth(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.d = +n[0], i + n[0].length) : -1;
  }

  function parseDayOfYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
  }

  function parseHour24(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.H = +n[0], i + n[0].length) : -1;
  }

  function parseMinutes(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.M = +n[0], i + n[0].length) : -1;
  }

  function parseSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.S = +n[0], i + n[0].length) : -1;
  }

  function parseMilliseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.L = +n[0], i + n[0].length) : -1;
  }

  function parseLiteralPercent(d, string, i) {
    var n = percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }

  function formatDayOfMonth(d, p) {
    return pad(d.getDate(), p, 2);
  }

  function formatHour24(d, p) {
    return pad(d.getHours(), p, 2);
  }

  function formatHour12(d, p) {
    return pad(d.getHours() % 12 || 12, p, 2);
  }

  function formatDayOfYear(d, p) {
    return pad(1 + d3Time.timeDay.count(d3Time.timeYear(d), d), p, 3);
  }

  function formatMilliseconds(d, p) {
    return pad(d.getMilliseconds(), p, 3);
  }

  function formatMonthNumber(d, p) {
    return pad(d.getMonth() + 1, p, 2);
  }

  function formatMinutes(d, p) {
    return pad(d.getMinutes(), p, 2);
  }

  function formatSeconds(d, p) {
    return pad(d.getSeconds(), p, 2);
  }

  function formatWeekNumberSunday(d, p) {
    return pad(d3Time.timeSunday.count(d3Time.timeYear(d), d), p, 2);
  }

  function formatWeekdayNumber(d) {
    return d.getDay();
  }

  function formatWeekNumberMonday(d, p) {
    return pad(d3Time.timeMonday.count(d3Time.timeYear(d), d), p, 2);
  }

  function formatYear(d, p) {
    return pad(d.getFullYear() % 100, p, 2);
  }

  function formatFullYear(d, p) {
    return pad(d.getFullYear() % 10000, p, 4);
  }

  function formatZone(d) {
    var z = d.getTimezoneOffset();
    return (z > 0 ? "-" : (z *= -1, "+"))
        + pad(z / 60 | 0, "0", 2)
        + pad(z % 60, "0", 2);
  }

  function formatUTCDayOfMonth(d, p) {
    return pad(d.getUTCDate(), p, 2);
  }

  function formatUTCHour24(d, p) {
    return pad(d.getUTCHours(), p, 2);
  }

  function formatUTCHour12(d, p) {
    return pad(d.getUTCHours() % 12 || 12, p, 2);
  }

  function formatUTCDayOfYear(d, p) {
    return pad(1 + d3Time.utcDay.count(d3Time.utcYear(d), d), p, 3);
  }

  function formatUTCMilliseconds(d, p) {
    return pad(d.getUTCMilliseconds(), p, 3);
  }

  function formatUTCMonthNumber(d, p) {
    return pad(d.getUTCMonth() + 1, p, 2);
  }

  function formatUTCMinutes(d, p) {
    return pad(d.getUTCMinutes(), p, 2);
  }

  function formatUTCSeconds(d, p) {
    return pad(d.getUTCSeconds(), p, 2);
  }

  function formatUTCWeekNumberSunday(d, p) {
    return pad(d3Time.utcSunday.count(d3Time.utcYear(d), d), p, 2);
  }

  function formatUTCWeekdayNumber(d) {
    return d.getUTCDay();
  }

  function formatUTCWeekNumberMonday(d, p) {
    return pad(d3Time.utcMonday.count(d3Time.utcYear(d), d), p, 2);
  }

  function formatUTCYear(d, p) {
    return pad(d.getUTCFullYear() % 100, p, 2);
  }

  function formatUTCFullYear(d, p) {
    return pad(d.getUTCFullYear() % 10000, p, 4);
  }

  function formatUTCZone() {
    return "+0000";
  }

  function formatLiteralPercent() {
    return "%";
  }

  var locale = locale$1({
    dateTime: "%a %b %e %X %Y",
    date: "%m/%d/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });

  var caES = locale$1({
    dateTime: "%A, %e de %B de %Y, %X",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    shortDays: ["dg.", "dl.", "dt.", "dc.", "dj.", "dv.", "ds."],
    months: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    shortMonths: ["gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des."]
  });

  var deCH = locale$1({
    dateTime: "%A, der %e. %B %Y, %X",
    date: "%d.%m.%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"], // unused
    days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    shortMonths: ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
  });

  var deDE = locale$1({
    dateTime: "%A, der %e. %B %Y, %X",
    date: "%d.%m.%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"], // unused
    days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    shortMonths: ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
  });

  var enCA = locale$1({
    dateTime: "%a %b %e %X %Y",
    date: "%Y-%m-%d",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });

  var enGB = locale$1({
    dateTime: "%a %e %b %X %Y",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });

  var esES = locale$1({
    dateTime: "%A, %e de %B de %Y, %X",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    shortDays: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    shortMonths: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  });

  var fiFI = locale$1({
    dateTime: "%A, %-d. %Bta %Y klo %X",
    date: "%-d.%-m.%Y",
    time: "%H:%M:%S",
    periods: ["a.m.", "p.m."],
    days: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"],
    shortDays: ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"],
    months: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
    shortMonths: ["Tammi", "Helmi", "Maalis", "Huhti", "Touko", "Kesä", "Heinä", "Elo", "Syys", "Loka", "Marras", "Joulu"]
  });

  var frCA = locale$1({
    dateTime: "%a %e %b %Y %X",
    date: "%Y-%m-%d",
    time: "%H:%M:%S",
    periods: ["", ""],
    days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    shortDays: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
    months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    shortMonths: ["jan", "fév", "mar", "avr", "mai", "jui", "jul", "aoû", "sep", "oct", "nov", "déc"]
  });

  var frFR = locale$1({
    dateTime: "%A, le %e %B %Y, %X",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"], // unused
    days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    shortDays: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
    months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    shortMonths: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
  });

  var heIL = locale$1({
    dateTime: "%A, %e ב%B %Y %X",
    date: "%d.%m.%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
    shortDays: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"],
    months: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
    shortMonths: ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"]
  });

  var huHU = locale$1({
    dateTime: "%Y. %B %-e., %A %X",
    date: "%Y. %m. %d.",
    time: "%H:%M:%S",
    periods: ["de.", "du."], // unused
    days: ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"],
    shortDays: ["V", "H", "K", "Sze", "Cs", "P", "Szo"],
    months: ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"],
    shortMonths: ["jan.", "feb.", "már.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."]
  });

  var itIT = locale$1({
    dateTime: "%A %e %B %Y, %X",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"], // unused
    days: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
    shortDays: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
    months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
    shortMonths: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
  });

  var jaJP = locale$1({
    dateTime: "%Y %b %e %a %X",
    date: "%Y/%m/%d",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
    shortDays: ["日", "月", "火", "水", "木", "金", "土"],
    months: ["睦月", "如月", "弥生", "卯月", "皐月", "水無月", "文月", "葉月", "長月", "神無月", "霜月", "師走"],
    shortMonths: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  });

  var koKR = locale$1({
    dateTime: "%Y/%m/%d %a %X",
    date: "%Y/%m/%d",
    time: "%H:%M:%S",
    periods: ["오전", "오후"],
    days: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
    shortDays: ["일", "월", "화", "수", "목", "금", "토"],
    months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    shortMonths: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
  });

  var mkMK = locale$1({
    dateTime: "%A, %e %B %Y г. %X",
    date: "%d.%m.%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["недела", "понеделник", "вторник", "среда", "четврток", "петок", "сабота"],
    shortDays: ["нед", "пон", "вто", "сре", "чет", "пет", "саб"],
    months: ["јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"],
    shortMonths: ["јан", "фев", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "ное", "дек"]
  });

  var nlNL = locale$1({
    dateTime: "%a %e %B %Y %T",
    date: "%d-%m-%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"], // unused
    days: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
    shortDays: ["zo", "ma", "di", "wo", "do", "vr", "za"],
    months: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
    shortMonths: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
  });

  var plPL = locale$1({
    dateTime: "%A, %e %B %Y, %X",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"], // unused
    days: ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"],
    shortDays: ["Niedz.", "Pon.", "Wt.", "Śr.", "Czw.", "Pt.", "Sob."],
    months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
    shortMonths: ["Stycz.", "Luty", "Marz.", "Kwie.", "Maj", "Czerw.", "Lipc.", "Sierp.", "Wrz.", "Paźdz.", "Listop.", "Grudz."]/* In Polish language abbraviated months are not commonly used so there is a dispute about the proper abbraviations. */
  });

  var ptBR = locale$1({
    dateTime: "%A, %e de %B de %Y. %X",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
    shortDays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    shortMonths: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  });

  var ruRU = locale$1({
    dateTime: "%A, %e %B %Y г. %X",
    date: "%d.%m.%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
    shortDays: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
    months: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    shortMonths: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
  });

  var svSE = locale$1({
    dateTime: "%A den %d %B %Y %X",
    date: "%Y-%m-%d",
    time: "%H:%M:%S",
    periods: ["fm", "em"],
    days: ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"],
    shortDays: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"],
    months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]
  });

  var zhCN = locale$1({
    dateTime: "%a %b %e %X %Y",
    date: "%Y/%-m/%-d",
    time: "%H:%M:%S",
    periods: ["上午", "下午"],
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    shortDays: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    shortMonths: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
  });

  var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

  function formatIsoNative(date) {
    return date.toISOString();
  }

  var formatIso = Date.prototype.toISOString
      ? formatIsoNative
      : locale.utcFormat(isoSpecifier);

  function parseIsoNative(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  }

  var parseIso = +new Date("2000-01-01T00:00:00.000Z")
      ? parseIsoNative
      : locale.utcParse(isoSpecifier);

  var timeFormat = locale.format;
  var timeParse = locale.parse;
  var utcFormat = locale.utcFormat;
  var utcParse = locale.utcParse;

  var version = "0.3.1";

  exports.version = version;
  exports.timeFormat = timeFormat;
  exports.timeParse = timeParse;
  exports.utcFormat = utcFormat;
  exports.utcParse = utcParse;
  exports.timeFormatLocale = locale$1;
  exports.timeFormatCaEs = caES;
  exports.timeFormatDeCh = deCH;
  exports.timeFormatDeDe = deDE;
  exports.timeFormatEnCa = enCA;
  exports.timeFormatEnGb = enGB;
  exports.timeFormatEnUs = locale;
  exports.timeFormatEsEs = esES;
  exports.timeFormatFiFi = fiFI;
  exports.timeFormatFrCa = frCA;
  exports.timeFormatFrFr = frFR;
  exports.timeFormatHeIl = heIL;
  exports.timeFormatHuHu = huHU;
  exports.timeFormatItIt = itIT;
  exports.timeFormatJaJp = jaJP;
  exports.timeFormatKoKr = koKR;
  exports.timeFormatMkMk = mkMK;
  exports.timeFormatNlNl = nlNL;
  exports.timeFormatPlPl = plPL;
  exports.timeFormatPtBr = ptBR;
  exports.timeFormatRuRu = ruRU;
  exports.timeFormatSvSe = svSE;
  exports.timeFormatZhCn = zhCN;
  exports.isoFormat = formatIso;
  exports.isoParse = parseIso;

}));
},{"d3-time":62}],62:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3_time = global.d3_time || {})));
}(this, function (exports) { 'use strict';

  var t0 = new Date;
  var t1 = new Date;
  function newInterval(floori, offseti, count, field) {

    function interval(date) {
      return floori(date = new Date(+date)), date;
    }

    interval.floor = interval;

    interval.round = function(date) {
      var d0 = new Date(+date),
          d1 = new Date(date - 1);
      floori(d0), floori(d1), offseti(d1, 1);
      return date - d0 < d1 - date ? d0 : d1;
    };

    interval.ceil = function(date) {
      return floori(date = new Date(date - 1)), offseti(date, 1), date;
    };

    interval.offset = function(date, step) {
      return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
    };

    interval.range = function(start, stop, step) {
      var range = [];
      start = new Date(start - 1);
      stop = new Date(+stop);
      step = step == null ? 1 : Math.floor(step);
      if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
      floori(start), offseti(start, 1);
      if (start < stop) range.push(new Date(+start));
      while (offseti(start, step), floori(start), start < stop) range.push(new Date(+start));
      return range;
    };

    interval.filter = function(test) {
      return newInterval(function(date) {
        while (floori(date), !test(date)) date.setTime(date - 1);
      }, function(date, step) {
        while (--step >= 0) while (offseti(date, 1), !test(date));
      });
    };

    if (count) {
      interval.count = function(start, end) {
        t0.setTime(+start), t1.setTime(+end);
        floori(t0), floori(t1);
        return Math.floor(count(t0, t1));
      };

      interval.every = function(step) {
        step = Math.floor(step);
        return !isFinite(step) || !(step > 0) ? null
            : !(step > 1) ? interval
            : interval.filter(field
                ? function(d) { return field(d) % step === 0; }
                : function(d) { return interval.count(0, d) % step === 0; });
      };
    }

    return interval;
  }

  var millisecond = newInterval(function() {
    // noop
  }, function(date, step) {
    date.setTime(+date + step);
  }, function(start, end) {
    return end - start;
  });

  // An optimized implementation for this simple case.
  millisecond.every = function(k) {
    k = Math.floor(k);
    if (!isFinite(k) || !(k > 0)) return null;
    if (!(k > 1)) return millisecond;
    return newInterval(function(date) {
      date.setTime(Math.floor(date / k) * k);
    }, function(date, step) {
      date.setTime(+date + step * k);
    }, function(start, end) {
      return (end - start) / k;
    });
  };

  var second$1 = 1e3;
  var minute = 6e4;
  var hour = 36e5;
  var day = 864e5;
  var week = 6048e5;

  var second = newInterval(function(date) {
    date.setTime(Math.floor(date / second$1) * second$1);
  }, function(date, step) {
    date.setTime(+date + step * second$1);
  }, function(start, end) {
    return (end - start) / second$1;
  }, function(date) {
    return date.getUTCSeconds();
  });

  var minute$1 = newInterval(function(date) {
    date.setTime(Math.floor(date / minute) * minute);
  }, function(date, step) {
    date.setTime(+date + step * minute);
  }, function(start, end) {
    return (end - start) / minute;
  }, function(date) {
    return date.getMinutes();
  });

  var hour$1 = newInterval(function(date) {
    var offset = date.getTimezoneOffset() * minute % hour;
    if (offset < 0) offset += hour;
    date.setTime(Math.floor((+date - offset) / hour) * hour + offset);
  }, function(date, step) {
    date.setTime(+date + step * hour);
  }, function(start, end) {
    return (end - start) / hour;
  }, function(date) {
    return date.getHours();
  });

  var day$1 = newInterval(function(date) {
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step);
  }, function(start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * minute) / day;
  }, function(date) {
    return date.getDate() - 1;
  });

  function weekday(i) {
    return newInterval(function(date) {
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    }, function(date, step) {
      date.setDate(date.getDate() + step * 7);
    }, function(start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * minute) / week;
    });
  }

  var sunday = weekday(0);
  var monday = weekday(1);
  var tuesday = weekday(2);
  var wednesday = weekday(3);
  var thursday = weekday(4);
  var friday = weekday(5);
  var saturday = weekday(6);

  var month = newInterval(function(date) {
    date.setHours(0, 0, 0, 0);
    date.setDate(1);
  }, function(date, step) {
    date.setMonth(date.getMonth() + step);
  }, function(start, end) {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
  }, function(date) {
    return date.getMonth();
  });

  var year = newInterval(function(date) {
    date.setHours(0, 0, 0, 0);
    date.setMonth(0, 1);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step);
  }, function(start, end) {
    return end.getFullYear() - start.getFullYear();
  }, function(date) {
    return date.getFullYear();
  });

  var utcMinute = newInterval(function(date) {
    date.setUTCSeconds(0, 0);
  }, function(date, step) {
    date.setTime(+date + step * minute);
  }, function(start, end) {
    return (end - start) / minute;
  }, function(date) {
    return date.getUTCMinutes();
  });

  var utcHour = newInterval(function(date) {
    date.setUTCMinutes(0, 0, 0);
  }, function(date, step) {
    date.setTime(+date + step * hour);
  }, function(start, end) {
    return (end - start) / hour;
  }, function(date) {
    return date.getUTCHours();
  });

  var utcDay = newInterval(function(date) {
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step);
  }, function(start, end) {
    return (end - start) / day;
  }, function(date) {
    return date.getUTCDate() - 1;
  });

  function utcWeekday(i) {
    return newInterval(function(date) {
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step * 7);
    }, function(start, end) {
      return (end - start) / week;
    });
  }

  var utcSunday = utcWeekday(0);
  var utcMonday = utcWeekday(1);
  var utcTuesday = utcWeekday(2);
  var utcWednesday = utcWeekday(3);
  var utcThursday = utcWeekday(4);
  var utcFriday = utcWeekday(5);
  var utcSaturday = utcWeekday(6);

  var utcMonth = newInterval(function(date) {
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(1);
  }, function(date, step) {
    date.setUTCMonth(date.getUTCMonth() + step);
  }, function(start, end) {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
  }, function(date) {
    return date.getUTCMonth();
  });

  var utcYear = newInterval(function(date) {
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCMonth(0, 1);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step);
  }, function(start, end) {
    return end.getUTCFullYear() - start.getUTCFullYear();
  }, function(date) {
    return date.getUTCFullYear();
  });

  var timeMilliseconds = millisecond.range;
  var timeSeconds = second.range;
  var timeMinutes = minute$1.range;
  var timeHours = hour$1.range;
  var timeDays = day$1.range;
  var timeSundays = sunday.range;
  var timeMondays = monday.range;
  var timeTuesdays = tuesday.range;
  var timeWednesdays = wednesday.range;
  var timeThursdays = thursday.range;
  var timeFridays = friday.range;
  var timeSaturdays = saturday.range;
  var timeWeeks = sunday.range;
  var timeMonths = month.range;
  var timeYears = year.range;

  var utcMillisecond = millisecond;
  var utcMilliseconds = timeMilliseconds;
  var utcSecond = second;
  var utcSeconds = timeSeconds;
  var utcMinutes = utcMinute.range;
  var utcHours = utcHour.range;
  var utcDays = utcDay.range;
  var utcSundays = utcSunday.range;
  var utcMondays = utcMonday.range;
  var utcTuesdays = utcTuesday.range;
  var utcWednesdays = utcWednesday.range;
  var utcThursdays = utcThursday.range;
  var utcFridays = utcFriday.range;
  var utcSaturdays = utcSaturday.range;
  var utcWeeks = utcSunday.range;
  var utcMonths = utcMonth.range;
  var utcYears = utcYear.range;

  var version = "0.2.4";

  exports.version = version;
  exports.timeMilliseconds = timeMilliseconds;
  exports.timeSeconds = timeSeconds;
  exports.timeMinutes = timeMinutes;
  exports.timeHours = timeHours;
  exports.timeDays = timeDays;
  exports.timeSundays = timeSundays;
  exports.timeMondays = timeMondays;
  exports.timeTuesdays = timeTuesdays;
  exports.timeWednesdays = timeWednesdays;
  exports.timeThursdays = timeThursdays;
  exports.timeFridays = timeFridays;
  exports.timeSaturdays = timeSaturdays;
  exports.timeWeeks = timeWeeks;
  exports.timeMonths = timeMonths;
  exports.timeYears = timeYears;
  exports.utcMillisecond = utcMillisecond;
  exports.utcMilliseconds = utcMilliseconds;
  exports.utcSecond = utcSecond;
  exports.utcSeconds = utcSeconds;
  exports.utcMinutes = utcMinutes;
  exports.utcHours = utcHours;
  exports.utcDays = utcDays;
  exports.utcSundays = utcSundays;
  exports.utcMondays = utcMondays;
  exports.utcTuesdays = utcTuesdays;
  exports.utcWednesdays = utcWednesdays;
  exports.utcThursdays = utcThursdays;
  exports.utcFridays = utcFridays;
  exports.utcSaturdays = utcSaturdays;
  exports.utcWeeks = utcWeeks;
  exports.utcMonths = utcMonths;
  exports.utcYears = utcYears;
  exports.timeMillisecond = millisecond;
  exports.timeSecond = second;
  exports.timeMinute = minute$1;
  exports.timeHour = hour$1;
  exports.timeDay = day$1;
  exports.timeSunday = sunday;
  exports.timeMonday = monday;
  exports.timeTuesday = tuesday;
  exports.timeWednesday = wednesday;
  exports.timeThursday = thursday;
  exports.timeFriday = friday;
  exports.timeSaturday = saturday;
  exports.timeWeek = sunday;
  exports.timeMonth = month;
  exports.timeYear = year;
  exports.utcMinute = utcMinute;
  exports.utcHour = utcHour;
  exports.utcDay = utcDay;
  exports.utcSunday = utcSunday;
  exports.utcMonday = utcMonday;
  exports.utcTuesday = utcTuesday;
  exports.utcWednesday = utcWednesday;
  exports.utcThursday = utcThursday;
  exports.utcFriday = utcFriday;
  exports.utcSaturday = utcSaturday;
  exports.utcWeek = utcSunday;
  exports.utcMonth = utcMonth;
  exports.utcYear = utcYear;
  exports.timeInterval = newInterval;

}));
},{}],63:[function(require,module,exports){
var points = require('idris-geojson-points')

module.exports = function(col, callback) {
	points(col, function(pts) {
		var minLng = Infinity
		var minLat = Infinity
		var maxLng = - Infinity
		var maxLat = - Infinity
		for(i=0;i<pts.length;i++) {
			if(pts[i][0] > maxLng) { maxLng = pts[i][0] }
			if(pts[i][0] < minLng) { minLng = pts[i][0] }
			if(pts[i][1] > maxLat) { maxLat = pts[i][1] }
			if(pts[i][1] < minLat) { minLat = pts[i][1] }
		}
		callback([minLng, minLat, maxLng, maxLat])
	})
}

},{"idris-geojson-points":64}],64:[function(require,module,exports){
module.exports = function(col, callback) {
	featLoop(0, col.features, [], function(points) {
		callback(points)
	})
}

function featLoop(count, feats, points, callback) {
	if(count === feats.length) { callback(points) }
	else {
		var f = feats[count]
		if(f.geometry !== undefined) {
			var type = f.geometry.type
			var coords = f.geometry.coordinates
			if(type === 'Point') {
				points.push(coords)
			} else if(type === 'LineString') {
				for(i=0;i<coords.length;i++) {
					points.push(coords[i])
				}
			} else if(type === 'Polygon') {
				for(i=0;i<coords.length;i++) {
					for(j=0;j<coords[i].length;j++) {
						points.push(coords[i][j])
					}
				}
			} else if(type === 'MultiPoint') {
				for(i=0;i<coords.length;i++) {
					points.push(coords[i])
				}
			} else if(type === 'MultiLineString') {
				for(i=0;i<coords.length;i++) {
					for(j=0;j<coords[i].length;j++) {
						points.push(coords[i][j])
					}
				}
			} else if(type === 'MultiPolygon') {
				for(i=0;i<coords.length;i++) {
					for(j=0;j<coords[i].length;j++) {
						for(k=0;k<coords[i][j].length;k++) {
							points.push(coords[i][j][k])
						}
					}
				}
			}
		}
		count = count + 1
		if(Math.floor(count/100) === Math.floor(count/100)) {
			setTimeout(function() {
				featLoop(count, feats, points, callback)
			},1)
		} else {
			featLoop(count, feats, points, callback)
		}

	}
}



},{}],65:[function(require,module,exports){
// a tile is an array [x,y,z]
var d2r = Math.PI / 180,
    r2d = 180 / Math.PI;

function tileToBBOX (tile) {
    var e = tile2lon(tile[0]+1,tile[2]);
    var w = tile2lon(tile[0],tile[2]);
    var s = tile2lat(tile[1]+1,tile[2]);
    var n = tile2lat(tile[1],tile[2]);
    return [w,s,e,n];
}

function tileToGeoJSON (tile) {
    var bbox = tileToBBOX(tile);
    var poly = {
        type: 'Polygon',
        coordinates:
            [
                [
                    [bbox[0],bbox[1]],
                    [bbox[0], bbox[3]],
                    [bbox[2], bbox[3]],
                    [bbox[2], bbox[1]],
                    [bbox[0], bbox[1]]
                ]
            ]
    };
    return poly;
}

function tile2lon(x, z) {
    return (x/Math.pow(2,z)*360-180);
}

function tile2lat(y, z) {
    var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
    return (r2d*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

function pointToTile(lon, lat, z) {
    var tile = pointToTileFraction(lon, lat, z);
    tile[0] = Math.floor(tile[0]);
    tile[1] = Math.floor(tile[1]);
    return tile;
}

function getChildren (tile) {
    return [
        [tile[0]*2, tile[1]*2, tile[2]+1],
        [tile[0]*2+1, tile[1]*2, tile[2 ]+1],
        [tile[0]*2+1, tile[1]*2+1, tile[2]+1],
        [tile[0]*2, tile[1]*2+1, tile[2]+1],
    ];
}

function getParent (tile) {
    // top left
    if(tile[0]%2===0 && tile[1]%2===0) {
        return [tile[0]/2, tile[1]/2, tile[2]-1];
    }
    // bottom left
    else if((tile[0]%2===0) && (!tile[1]%2===0)) {
        return [tile[0]/2, (tile[1]-1)/2, tile[2]-1];
    }
    // top right
    else if((!tile[0]%2===0) && (tile[1]%2===0)) {
        return [(tile[0]-1)/2, (tile[1])/2, tile[2]-1];
    }
    // bottom right
    else {
        return [(tile[0]-1)/2, (tile[1]-1)/2, tile[2]-1];
    }
}

function getSiblings (tile) {
    return getChildren(getParent(tile));
}

function hasSiblings(tile, tiles) {
    var siblings = getSiblings(tile);
    for (var i = 0; i < siblings.length; i++) {
        if (!hasTile(tiles, siblings[i])) return false;
    }
    return true;
}

function hasTile(tiles, tile) {
    for (var i = 0; i < tiles.length; i++) {
        if (tilesEqual(tiles[i], tile)) return true;
    }
    return false;
}

function tilesEqual(tile1, tile2) {
    return (
        tile1[0] === tile2[0] &&
        tile1[1] === tile2[1] &&
        tile1[2] === tile2[2]
    );
}

function tileToQuadkey(tile) {
  var index = '';
  for (var z = tile[2]; z > 0; z--) {
      var b = 0;
      var mask = 1 << (z - 1);
      if ((tile[0] & mask) !== 0) b++;
      if ((tile[1] & mask) !== 0) b += 2;
      index += b.toString();
  }
  return index;
}

function quadkeyToTile(quadkey) {
    var x = 0;
    var y = 0;
    var z = quadkey.length;

    for (var i = z; i > 0; i--) {
        var mask = 1 << (i - 1);
        switch (quadkey[z - i]) {
            case '0':
                break;

            case '1':
                x |= mask;
                break;

            case '2':
                y |= mask;
                break;

            case '3':
                x |= mask;
                y |= mask;
                break;
        }
    }
    return [x,y,z];
}

function bboxToTile(bboxCoords) {
    var min = pointToTile(bboxCoords[0], bboxCoords[1], 32);
    var max = pointToTile(bboxCoords[2], bboxCoords[3], 32);
    var bbox = [min[0], min[1], max[0], max[1]];

    var z = getBboxZoom(bbox);
    if (z === 0) return [0,0,0];
    var x = bbox[0] >>> (32 - z);
    var y = bbox[1] >>> (32 - z);
    return [x,y,z];
}

function getBboxZoom(bbox) {
    var MAX_ZOOM = 28;
    for (var z = 0; z < MAX_ZOOM; z++) {
        var mask = 1 << (32 - (z + 1));
        if (((bbox[0] & mask) != (bbox[2] & mask)) ||
            ((bbox[1] & mask) != (bbox[3] & mask))) {
            return z;
        }
    }

    return MAX_ZOOM;
}

function pointToTileFraction(lon, lat, z) {
    var sin = Math.sin(lat * d2r),
        z2 = Math.pow(2, z),
        x = z2 * (lon / 360 + 0.5),
        y = z2 * (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);
    return [x, y, z];
}

module.exports = {
    tileToGeoJSON: tileToGeoJSON,
    tileToBBOX: tileToBBOX,
    getChildren: getChildren,
    getParent: getParent,
    getSiblings: getSiblings,
    hasTile: hasTile,
    hasSiblings: hasSiblings,
    tilesEqual: tilesEqual,
    tileToQuadkey: tileToQuadkey,
    quadkeyToTile: quadkeyToTile,
    pointToTile: pointToTile,
    bboxToTile: bboxToTile,
    pointToTileFraction: pointToTileFraction
};

},{}]},{},[1]);
