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
