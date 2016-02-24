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

},{"./lib/canvas/index":9,"./lib/svg/index":33,"idris-geojson-bbox":46}],3:[function(require,module,exports){
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

},{"./points/clean-features":13,"./points/set-default-style":14}],5:[function(require,module,exports){
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

},{"./lines/clean-features":10,"./lines/set-default-style":11}],6:[function(require,module,exports){
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

},{"./points/add-image-file":12,"./points/clean-features":13,"./points/set-default-style":14}],7:[function(require,module,exports){
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

},{"./polygons/clean-features":15,"./polygons/set-default-style":16}],8:[function(require,module,exports){
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



























},{"./tiles/check-options":18,"./tiles/find-tiles":19,"./tiles/get-tiles-info":21,"./tiles/get-zoom-level":23,"./tiles/load-imgs":24,"./tiles/parse-url":25}],9:[function(require,module,exports){
var getProj = require('../get-proj')
var saveAs = require('../file-saver')

var Background = require('./Background')
var Polygons = require('./Polygons')
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

},{"../file-saver":26,"../get-proj":27,"./Background":3,"./Labels":4,"./Lines":5,"./Markers":6,"./Polygons":7,"./Tiles":8}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
module.exports = function(file, x) {
	var img = new Image()
	img.addEventListener('load', function() {
		x.imagesDoneLoading()
	}, false)
	img.src = file
	return img
}

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
var tilebelt = require('tilebelt')

module.exports = function(left, right, z) {
	var leftFrac = tilebelt.pointToTileFraction(left[0], left[1], z)
	var rightFrac = tilebelt.pointToTileFraction(right[0], right[1], z)
	var pixels = (rightFrac[0] - leftFrac[0]) * 256
	return pixels
}


},{"tilebelt":48}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"tilebelt":48}],20:[function(require,module,exports){
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

},{"tilebelt":48}],21:[function(require,module,exports){
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

},{"./get-position":20,"./get-url":22}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"./calc-pixels":17,"tilebelt":48}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{"d3-geo":45}],28:[function(require,module,exports){
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



},{"./points/append-layer":38,"./points/clean-features":39,"./points/set-default-style":40}],29:[function(require,module,exports){
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



},{"./lines/add-labels":34,"./lines/append-layer":35,"./lines/clean-features":36,"./lines/set-default-style":37}],30:[function(require,module,exports){
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



},{"./points/append-layer":38,"./points/clean-features":39}],31:[function(require,module,exports){
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





},{"./polygons/append-layer":41,"./polygons/clean-features":42,"./polygons/set-default-style":43}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
var getProj = require('../get-proj')
var saveAs = require('../file-saver')

var Lines = require('./Lines')
var Polygons = require('./Polygons')
var Markers = require('./Markers')
var Labels = require('./Labels')
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

},{"../file-saver":26,"../get-proj":27,"./Labels":28,"./Lines":29,"./Markers":30,"./Polygons":31,"./background":32}],34:[function(require,module,exports){
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

},{"../utils":44}],35:[function(require,module,exports){
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

},{"../utils":44}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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



},{"../utils":44}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{"../utils":44}],42:[function(require,module,exports){
module.exports = function(feats) {
	var r = []
	for(i=0;i<feats.length;i++) {
		if(feats[i].geometry.type === 'Polygon' || feats[i].geometry.type === 'MultiPolygon' ) {
			r.push(feats[i])
		}
	}
	return r
}

},{}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
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

},{}],45:[function(require,module,exports){
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
},{}],46:[function(require,module,exports){
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

},{"idris-geojson-points":47}],47:[function(require,module,exports){
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



},{}],48:[function(require,module,exports){
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
