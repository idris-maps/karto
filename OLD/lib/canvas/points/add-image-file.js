module.exports = function(file, x) {
	var img = new Image()
	img.addEventListener('load', function() {
		x.imagesDoneLoading()
	}, false)
	img.src = file
	return img
}
