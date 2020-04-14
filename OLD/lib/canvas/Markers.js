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
