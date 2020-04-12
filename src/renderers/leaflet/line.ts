import { Map, geoJSON } from 'leaflet'
import { KartoLine } from '../../parser/elements/line'
import convertStyle from './style'

export default (map: Map) =>
  (layer: KartoLine) => {
    console.log(convertStyle(layer.props))
    geoJSON(layer.props.geometry, { style: convertStyle(layer.props) }).addTo(map)
  }