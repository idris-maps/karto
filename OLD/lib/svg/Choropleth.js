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








