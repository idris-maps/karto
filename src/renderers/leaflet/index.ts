import { map as Lmap, tileLayer, circle, CircleMarkerOptions } from 'leaflet'
import xml from 'xml-string'
import { marker as myMarker } from '../svg/defs'
import defaults from '../utils/defaults'
import getBounds from '../utils/getBounds'
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

export default (elementId: string, data: any) => {
  if (!isKartoMap(data)) {
    throw new Error('Invalid karto definition')
  }
  const element = document ? document.getElementById(elementId) : undefined
  if (!element) {
    throw new Error(`Element "#${elementId}" does not exist`)
  }

  const map = Lmap(element).fitBounds(getBounds(data))

  data.children.map(layer => {
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
  })
}
