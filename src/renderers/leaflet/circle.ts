import { CircleMarkerOptions, Map, circle } from 'leaflet'
import { CircleStyle, StrokeLinejoin } from '../../parser/elements/style'
import { KartoCircle } from '../../parser/elements/circle'

const fixLineJoin = (d?: StrokeLinejoin): "round" | "inherit" | "bevel" | "miter" | undefined => {
  // @ts-ignore
  if (['round', 'bevel', 'miter'].includes(d)) {
    // @ts-ignore
    return d
  }
  return undefined
}

const convertStyle = (style: CircleStyle): CircleMarkerOptions => ({
  stroke: Boolean(style.stroke),
  color: style.fill,
  opacity: style.strokeOpacity,
  lineCap: style.strokeLinecap,
  lineJoin: fixLineJoin(style.strokeLinejoin),
  dashArray: style.strokeDasharray,
  fill: Boolean(style.fill),
  fillColor: style.fill,
  fillOpacity: style.fillOpacity,
  radius: style.r * 10,
})

export default (map: Map) =>
  (layer: KartoCircle) => {
    if (layer.props.geometry.type === 'MultiPoint') {
      layer.props.geometry.coordinates.map(([x, y]) => {
        circle([y, x], convertStyle(layer.props)).addTo(map)
      })
    } else {
      const [x, y] = layer.props.geometry.coordinates
      circle([y, x], convertStyle(layer.props)).addTo(map)
    }
  }