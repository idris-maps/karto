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
