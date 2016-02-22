var getProj = require('../get-proj')
var Background = require('./Background')
var Polygons = require('./Polygons')
var Lines = require('./Lines')

module.exports = function(divId, w, h, bbox) {
	var self = this
	self.id = Date.now()
	self.div = document.getElementById(divId)	
	self.size = {width: w, height: h}
	self.canvas = createCanvas(self.div, self.size)
	self.ctx = self.canvas.getContext('2d')
	self.objs = []
	self.imgs = []
	self.imagesLoading = 0
	self.bbox = bbox
	self.proj = getProj(self.size, self.bbox)
	self.background = function(color) { 
		var o = new Background(color, self) 
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
	self.draw = function() {
		draw(self)
	}
}

function draw(map) {
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
