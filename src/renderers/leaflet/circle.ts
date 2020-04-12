import { CircleMarkerOptions, Map, circle } from 'leaflet'
import { CircleStyle, StrokeLinejoin } from '../../parser/elements/style'
import { KartoCircle } from '../../parser/elements/circle'
import convertStyle from './style'

const fixLineJoin = (d?: StrokeLinejoin): "round" | "inherit" | "bevel" | "miter" | undefined => {
  // @ts-ignore
  if (['round', 'bevel', 'miter'].includes(d)) {
    // @ts-ignore
    return d
  }
  return undefined
}

export default (map: Map) =>
  (layer: KartoCircle) => {
    const style = { ...convertStyle(layer.props), radius: layer.props.r }
    if (layer.props.geometry.type === 'MultiPoint') {
      layer.props.geometry.coordinates.map(([x, y]) => {
        circle([y, x], style).addTo(map)
      })
    } else {
      const [x, y] = layer.props.geometry.coordinates
      circle([y, x], style).addTo(map)
    }
  }