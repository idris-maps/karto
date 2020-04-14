import { Map, divIcon, marker } from 'leaflet'
import { KartoLabel } from '../../elements/label'
import getStyle from '../utils/getStyle'
import './label.css'

const createIcon = (props: KartoLabel['props']) => {
  const style = getStyle(props)
    .filter(({ key }) => !['text'].includes(key))
  const svg = document.createElement('svg')
  const text = document.createElement('text')
  style.map(({ key, value }) => text.setAttribute(key, value))
  text.textContent = props.text
  svg.appendChild(text)
  return divIcon({ html: svg })
}

export default (map: Map) =>
  (layer: KartoLabel) => {
    const icon = createIcon(layer.props)
    if (layer.props.geometry.type === 'MultiPoint') {
      layer.props.geometry.coordinates.map(([x, y]) => {
        marker([y, x], { icon }).addTo(map)
      })
    } else {
      const [x, y] = layer.props.geometry.coordinates
      marker([y, x], { icon }).addTo(map)
    }
  }