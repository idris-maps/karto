import { map as Lmap, tileLayer } from 'leaflet'
import getBounds from '../utils/getBounds'
import validate from '../../validate'
import { KartoLayer } from '../../parser/elements'
import { isKartoMap } from '../../parser/elements/map'
import { isKartoPolygon } from '../../parser/elements/polygon'
import { isKartoLine } from '../../parser/elements/line'
import { isKartoCircle } from '../../parser/elements/circle'
import { isKartoLabel } from '../../parser/elements/label'
import { isKartoMarker } from '../../parser/elements/marker'
import { isKartoTiles } from '../../parser/elements/tiles'

import drawMarker from './marker'
import drawCircle from './circle'
import drawPolygon from './polygon'
import drawLine from './line'
import drawLabel from './label'

export default (elementId: string, data: any) => {

  const { isValid, error } = validate(data)
  if (!isValid && !isKartoMap(data)) {
    throw new Error(error)
  }

  const element = document ? document.getElementById(elementId) : undefined
  if (!element) {
    throw new Error(`Element "#${elementId}" does not exist`)
  }

  const map = Lmap(element).fitBounds(getBounds(data))

  data.children.map((layer: KartoLayer) => {
    if (isKartoTiles(layer)) {
      tileLayer(layer.props.url, layer.props).addTo(map)
      return
    }
    if (isKartoMarker(layer)) {
      drawMarker(map)(layer)
      return
    }
    if (isKartoCircle(layer)) {
      drawCircle(map)(layer)
      return
    }
    if (isKartoPolygon(layer)) {
      drawPolygon(map)(layer)
      return
    }
    if (isKartoLine(layer)) {
      drawLine(map)(layer)
      return
    }
    if (isKartoLabel(layer)) {
      drawLabel(map)(layer)
    }
  })
}
