# Canvas map

## Initialize with karto.canvas()

```
var map = karto.canvas(divId, width, height, bbox)
```

- **divId**: unique id of the ```<div>``` element where the map should be
- **width** / **height**: of the canvas
- **bbox**: bounding box of the map [min. longitude, min. latitude, max. longitude, max. latitude]

**After adding background, polygons, lines, points and tiles, draw the map with:**

```
map.draw()
```

Layers will be drawn in the order they have been added.

## .background()

Add a background color.

```
map.background(color)
```

- **color**: html color

## .polygons()

Add a polygon collection

```
var myPolygons = map.polygons(collection, style)
```

- **collection**: a GeoJSON collection with *Polygon* and *MultiPolygon* features (required)
- **style**: style of the polygons (optional)

### Polygon style options

- **fill**: fill color (default: 'black')
- **stroke**: outline color (default: 'none')
- **opacity**: number between 0 and 1 (default: 1)
- **line-width**: width of outline (default: 1)

To see the current style:

```
console.log(myPolygons.style)
```

## .lines()

Add a line collection

```
var myLines = map.lines(collection, style)
```

- **collection**: a GeoJSON collection with *LineSting* and *MultiLineString* features (required)
- **style**: style of the lines (optional)

### Line style options

- **stroke**: line color (default: 'none')
- **opacity**: number between 0 and 1 (default: 1)
- **line-width**: width of line (default: 1)

To see the current style:

```
console.log(myLines.style)
```

## Points

Points can be represented either as markers or as labels

### .markers()

Add point markers

```
var myMarkers = map.markers(collection, imageUrl, style)
```

- **collection**: a GeoJSON collection with *Point* and *MultiPoint* features (required)
- **imageUrl**: path to the image (required)
- **style**: style of the markers (optional)

#### Markers style options

- **opacity**: number between 0 and 1 (default: 1)
- **width**: width of the marker (defaults to the actual width of the image file)
- **height**: height of the marker (defaults to the actual height of the image file)
- **iconAnchor**: array of two numbers defining what part of the image corresponds to the point (defaults to half the height and half the width)

To see the current style:

```
console.log(myMarkers.style)
```

### .labels()

Add point labels

```
var myLabels = map.markers(collection, property, style, translate)
```

- **collection**: a GeoJSON collection with *Point* and *MultiPoint* features (required)
- **property**: feature property to use as label (required)
- **style**: style of the labels (optional)
- **translate**: array of two numbers [x,y] to move the label from the point. Ex: [0,20] will put the label 20px under the point (optional)

#### Point labels style options

- **fill**: the color of the text (default: 'black')
- **stroke**: outline color of the text (default: 'none')
- **font-family** (default: 'sans-serif')
- **font-size** (default: '10px') 
- **text-anchor**: which part of the text ('start', 'middle' or 'end') corresponds to the point (default: 'middle')
- **opacity**:  number between 0 and 1 (default: 1)

To see the current style:

```
console.log(myLabels.style)
```

## .tiles()

Add tiles from a server

```
var myTiles = map.tiles(url, options, opacity, zoomLevel)
```

- **url**: url of the tile server (required)
- **options**: tile server options (required)
- **opacity**: number between 0 and 1 (optional - default: 1)
- **zoomLevel** (optional - defaults to highest without enlarging tiles)

### Tile servers

You can find a list of tile servers [here](https://leaflet-extras.github.io/leaflet-providers/preview/).

**Before using tiles from a server, check with the owner if it is allowed. If you use tiles for a published map, do not forget to credit the owner of the tile server.**

#### URL

The URL follows the convention from LeafletJS as in the link above. For example, classic OpenStreetMap tiles have this URL:

```
'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
```

#### Options

The parts of the URL between brackets ```{}``` need to be declared, except for ```{x}```, ```{y}``` and ```{z}``` that will be calculated.

```{s}``` are the possible subdomains. It defaults to ```'abc'``` (as used by OSM), if the server has other subdomains, they need to be declared in **options**.

Example with tiles from [MapQuest](http://www.mapquest.com/), the URL looks like this:

```
'http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}'
```

The subdomains are not 'abc' but '1234' and two variables need to be declared: ```{type}``` and ```{ext}```. The **options** should look like this:

```
var tileOptions = {
	type: 'map',
	ext: 'jpg',
	subdomains: '1234'
}
```

## Save the map

Create a download button in the top left corner of the screen:

```
map.downloadButton()
```

Load the page and click the button.
```
