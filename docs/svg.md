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

## .background()

```
svgMap.background(color)
```

- **color**: html color

## .polygons()

```
var myPolygons = svgMap.polygons(collection, style)
```

- **collection**: a GeoJSON collection with *Polygon* and *MultiPolygon* features (required)
- **style**: SVG style of the polygons (optional)

### .choropleth()

Polygons can also be colored depending on the value of one of its properties.

```
var myChoropleth = svgMap.choropleth(collection, scaleOptions, style)
```

- **collection**: a GeoJSON collection with *Polygon* and *MultiPolygon* features (required)
- **scaleOptions**: see below (required)
- **style**: SVG style of the polygons (optional) the *fill* declared here will be used for features where the property is undefined

#### scaleOptions

An object with the following keys: ```prop```, ```type``` and ```range```. All are required.

- **prop**: the property which value will be used to color the polygons
- **type**: can be "linear" or "threshold"
- **range**: an array of HTML colors

## .lines()

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

### .markers()

```
var myMarkers = svgMap.markers(collection, imageUrl, style)
```

- **collection**: a GeoJSON collection with *Point* and *MultiPoint* features (required)
- **imageUrl**: path to the image (required)
- **style**: style of the markers (optional)

### .labels()

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
