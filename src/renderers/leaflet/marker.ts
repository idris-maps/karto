import { Map, marker, icon } from 'leaflet'
import xml from 'xml-string'
import { marker as myMarker } from '../svg/defs'
import { KartoMarker, MarkerProps } from '../../elements/marker'
import getStyle from '../utils/getStyle'

const createMarker = (props: MarkerProps) => {
  const width = props.width || 24
  const height = width * 1.5
  const style = getStyle(props)
    .filter(({ key }) => key !== 'width')
    .reduce((r, { key, value }) => ({ ...r, [key]: value }), {})
  const svg = xml.create('svg').attr({
    width,
    height,
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
  })
  const g = svg.child('g').attr({...style, transform: `scale(${width / 24})` })
  g.child('path').attr({ d: myMarker.d })
  return svg.outer().split(`"`).join(`'`)
}

export default (map: Map) =>
  (layer: KartoMarker) => {
    const width = layer.props.width || 24
    const height = width * 1.5
    const m = createMarker(layer.props)
    const markerIcon = icon({
      iconUrl: `data:image/svg+xml,${m}`,
      iconSize: [width, height],
      iconAnchor: [width / 2, height / 36 * 32]
    })
    if (layer.props.geometry.type === 'MultiPoint') {
      layer.props.geometry.coordinates.map(([x, y]) => {
        marker([y, x], { icon: markerIcon }).addTo(map)
      })
    } else {
      const [x, y] = layer.props.geometry.coordinates
      marker([y, x], { icon: markerIcon }).addTo(map)
    }
  }