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
