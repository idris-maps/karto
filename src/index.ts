import { karto } from './parser'
import renderSvgString from './renderers/svg'
import renderWithLeaflet from './renderers/leaflet'
import validateMapDefinition from './validate'

export default {
  karto,
  renderSvgString,
  renderWithLeaflet,
  validateMapDefinition,
}