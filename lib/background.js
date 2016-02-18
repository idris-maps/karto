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
