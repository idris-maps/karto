import { Map, geoJSON } from 'leaflet'
import { KartoPolygon } from '../../parser/elements/polygon'
import convertStyle from './style'

export default (map: Map) =>
  (layer: KartoPolygon) => {
    geoJSON(layer.props.geometry, { style: convertStyle(layer.props) }).addTo(map)
  }