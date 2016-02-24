var cleanFeatures = require('./polygons/clean-features')
var setDefaultStyle = require('./polygons/set-default-style')
var appendLayer = require('./choropleth/append-layer')

module.exports = function(layerId, feats, opts, style, map) {
	var self = this
	self.id = layerId
	self.features = cleanFeatures(feats)
	self.style = setDefaultStyle(style)
	self.prop = opts.prop
	self.type = opts.type
	self.range = checkRange(opts.range)
	self.domain = getDomain(self)
	self.scale = getScale(self)
	if(self.scale === null) { 
		console.log('Could not draw choropleth')
		if(self.type === undefined) { console.log('Type is undefined') }
		if(self.range === null) { console.log('Range is undefined') }
		if(self.prop === undefined) { console.log('Prop is undefined') }
	} else { 
		addFill(self)
		appendLayer(self, map) 
	}
	return this
}

function addFill(o) {
	var scale = o.scale
	var prop = o.prop
	for(i=0;i<o.features.length;i++) {
		var v = o.features[i].properties[prop]
		if(v !== null && v !== undefined) {
			o.features[i].properties.fill = scale(v)
		}
	}
}

var s = require('d3-scale')

function getScale(o) {
	var opts = o.scaleOptions
	var type = o.type
	var domain = o.domain
	var range = o.range
	if(type === 'threshold') { var scale = s.scaleThreshold() }
	else if(type === 'linear') { var scale = s.scaleLinear() }
	else { return null }
	if(domain === null || range === null) {
		return null
	} else {
		return scale.domain(domain).range(range)
	}
}

function getDomain(o) {
	if(o.range === null) { return null }
	else {
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
					var range = [minVal]
					for(i=1;i<nbRange-1;i++) {
						range.push(all[rg[i]])
					}
					range.push(maxVal)
					return range
				}
			}
			else if(type === 'threshold') {
				if(nbRange === 2) { return [all[Math.round(nbFeats/2)]] }
				else {
					var rg = []
					for(i=0;i<nbRange;i++) {
						rg.push(Math.round((nbFeats / nbRange) * i) - 1)
					}
					var range = []
					for(i=1;i<nbRange;i++) {
						range.push(all[rg[i]])
					}
					return range
				}
			} 
		}
	}
}

function checkRange(range) {
	if(Array.isArray(range)) {
		if(range.length > 1) {
			return range
		} else {
			return null
		} 
	} else {
		return null
	}
} 
