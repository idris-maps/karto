import { Map, geoJSON } from 'leaflet'
import { KartoLine } from '../../elements/line'
import convertStyle from './style'

export default (map: Map) =>
  (layer: KartoLine) => {
    geoJSON(layer.props.geometry, { style: convertStyle(layer.props) }).addTo(map)
  }