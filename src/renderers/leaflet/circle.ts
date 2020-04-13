import { Map, circle } from 'leaflet'
import { KartoCircle } from '../../parser/elements/circle'
import convertStyle from './style'

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