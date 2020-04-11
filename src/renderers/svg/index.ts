import xml from 'xml-string'
import getProjection from '../utils/getProjection'
import defaults from '../utils/defaults'
import { isKartoMap } from '../../parser/elements/map'
import addDefs from './defs'

import { isKartoPolygon } from '../../parser/elements/polygon'
import { isKartoLine } from '../../parser/elements/line'
import { isKartoCircle } from '../../parser/elements/circle'
import { isKartoLabel } from '../../parser/elements/label'
import { isKartoMarker } from '../../parser/elements/marker'

import drawPolygon from './polygon'
import drawLine from './line'
import drawCircle from './circle'
import drawLabel from './label'
import drawMarker from './marker'

export default (data: any) => {
  if (!isKartoMap(data)) {
    throw new Error('Invalid karto definition')
  }
  const width = data.props.width || defaults.width
  const height = data.props.height || defaults.height
  const projection = getProjection(data, width, height)

  const svg = xml.create('svg')
    .attr({
      viewBox: `0 0 ${width} ${height}`,
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    })

  addDefs(svg)

  data.children.map(layer => {
    if (isKartoPolygon(layer)) {
      drawPolygon(svg, projection)(layer)
      return
    }
    if (isKartoLine(layer)) {
      drawLine(svg, projection)(layer)
      return
    }
    if (isKartoCircle(layer)) {
      drawCircle(svg, projection)(layer)
      return
    }
    if (isKartoLabel(layer)) {
      drawLabel(svg, projection)(layer)
      return
    }
    if (isKartoMarker(layer)) {
      drawMarker(svg, projection)(layer)
      return
    }
  })

  return svg.outer()
}