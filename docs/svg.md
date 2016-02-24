# SVG map

In your HTML, you need to have a ```<div>``` element with a unique id where the map will be drawn

```
<div id="map"></div>
```

## Initialize with karto.svg()

```
var svgMap = karto.svg(divId, width, height, bbox)
```

- **divId**: unique id of the ```<div>``` element where the map should be
- **width** / **height**: of the SVG
- **bbox**: bounding box of the map [min. longitude, min. latitude, max. longitude, max. latitude]

Layers will be drawn in the order they have been added.

## Background color

```
svgMap.background(color)
```

- **color**: html color

## Polygons

```
var myPolygons = svgMap.polygons(collection, style)
```

- **collection**: a GeoJSON collection with *Polygon* and *MultiPolygon* features (required)
- **style**: SVG style of the polygons (optional)

## Lines

```
var myLines = svgMap.lines(collection, style)
```

- **collection**: a GeoJSON collection with *LineSting* and *MultiLineString* features (required)
- **style**: SVG style of the lines (optional)

### Line labels

```
var myLinesLabels = myLines.addLabels(property, style, uppercase)
```

- **property**: GeoJSON feature property to use as label (required)
- **style**: SVG style of the labels (optional)
- **uppercase**: boolean if true labels will be uppercase (optional)

## Points

Points can be represented either as markers or as labels

### Image markers

```
var myMarkers = svgMap.markers(collection, imageUrl, style)
```

- **collection**: a GeoJSON collection with *Point* and *MultiPoint* features (required)
- **imageUrl**: path to the image (required)
- **style**: style of the markers (optional)

### Labels

```
var myLabels = svgMap.labels(collection, property, style, translate)
```

- **collection**: a GeoJSON collection with *Point* and *MultiPoint* features (required)
- **property**: feature property to use as label (required)
- **style**: style of the labels (optional)
- **translate**: array of two numbers [x,y] to move the label from the point. Ex: [0,20] will put the label 20px under the point (optional)

## Save the map

Create a download button in the top left corner of the screen:

```
map.downloadButton()
```

Load the page and click the button.
