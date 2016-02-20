# Karto

work in progress

## SVG map

### Init

```
var karto = require('karto')
var svgMap = karto.svg(divId, width, height, bbox)
```

- **divId**: unique id of the ```<div>``` element where the map should be
- **width** / **height**: of the SVG
- **bbox**: bounding box of the map [min. longitude, min. latitude, max. longitude, max. latitude]

### Background color

```
svgMap.background(color)
```

- **color**: html color

### Lines collection

```
var myLines = svgMap.lines(collection, style)
```

- **collection**: a GeoJSON collection with *LineSting* and *MultiLineString* features (required)
- **style**: SVG style of the lines (optional)

#### Line labels

```
var myLinesLabels = myLines.addLabels(property, style, uppercase)
```

- **property**: GeoJSON feature property to use as label (required)
- **style**: SVG style of the labels (optional)
- **uppercase**: boolean if true labels will be uppercase (optional)


### Polygons collection

```
var myPolygons = svgMap.polygons(collection, style)
```

- **collection**: a GeoJSON collection with *Polygon* and *MultiPolygon* features (required)
- **style**: SVG style of the polygons (optional)

### Image markers

```
var myMarkers = svgMap.markers(collection, imageUrl, style)
```

- **collection**: a GeoJSON collection with *Point* and *MultiPoint* features (required)
- **imageUrl**: path to the image (required)
- **style**: style of the markers (optional)

### Point labels

```
var myLabels = svgMap.markers(collection, property, style)
```

- **collection**: a GeoJSON collection with *Point* and *MultiPoint* features (required)
- **property**: feature property to use as label (required)
- **style**: style of the labels (optional)

## Utilities

### getCollectionBbox()

```
var karto = require('karto')
karto.getCollectionBbox(collection, function(bbox) { 
	/*  
		bbox as [min. longitude, min. latitude, max. longitude, max. latitude]
	*/
})
```

- **collection**: a GeoJSON collection
