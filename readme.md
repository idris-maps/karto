# Karto

A library to draw static maps on ```<svg>``` or ```<canvas>``` elements.

## Why

Why yet another javascript library? To create maps without any other software than a text editor and a (recent) browser. It is recommended to use Node / NPM / browserify but not necessary.

There are a number of libraries that let you draw maps. The best being D3. Karto uses D3's "geo" module to convert longitude-latitude coordinates to pixel coordinates. Karto offers a simple and straight forward API to create maps. It is lighter as it does not use the whole of D3. In order to do this, Karto makes a number of assumptions:

* The data comes in GeoJSON
* The projection to use is Mercator
* You will not need animation or interaction

For all other use cases, D3 is what you are looking for.

## Usage

### Install

#### To use with browserify

```
$ npm install karto
```

And:

```
var karto = require('karto')
```

#### To use directly in HTML

Download the script [here](https://raw.githubusercontent.com/idris-maps/karto/master/dist/karto.min.js)

And include it in the HTML:

```
<script src="karto.min.js"></script>
```


## SVG or Canvas

The APIs are more or less the same but some methods are specific to the element on which the map willbe rendered.

**Differences**

### SVG

* You can have text along lines (road names for example)
* The file is saved as a vector image

[Documentation for SVG maps](https://github.com/idris-maps/karto/blob/master/svg.md)

### Canvas

* You can have a tiled background from a remote server
* The file is saved as a raster image

[Documentation for Canvas maps](https://github.com/idris-maps/karto/blob/master/canvas.md)

## Utilities

Some helpers that may be helpful using Karto.

### .getCollectionBbox()

To get the bounding box of a GeoJSON collection.

```
karto.getCollectionBbox(collection, function(bbox) { 
	/*  
		bbox as [min. longitude, min. latitude, max. longitude, max. latitude]
	*/
})
```

- **collection**: a GeoJSON collection

### .getJSON()

To load a GeoJSON file.

```
karto.getJSON(url, function(err, json) { 
	if(err) { console.log(err) }
	else {
		/*
			use your GeoJSON file
		*/
	}
})
```

- **url**: the path to your GeoJSON
