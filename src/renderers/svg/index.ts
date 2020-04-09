import xml from 'xml-string'
import getProjection from '../utils/getProjection'
import defaults from '../utils/defaults'
import { isKartoMap } from '../../parser/elements/map'

import { isKartoPolygon } from '../../parser/elements/polygon'
import { isKartoPolygons } from '../../parser/elements/polygons'
import { isKartoLine } from '../../parser/elements/line'
import { isKartoLines } from '../../parser/elements/lines'
import { isKartoCircle } from '../../parser/elements/circle'
import { isKartoCircles } from '../../parser/elements/circles'

import drawPolygon from './polygon'
import drawPolygons from './polygons'
import drawLine from './line'
import drawLines from './lines'
import drawCircle from './circle'
import drawCircles from './circles'

export default (data: any) => {
  if (!isKartoMap(data)) {
    throw new Error('Invalid karto definition')
  }
  const width = data.props.width || defaults.width
  const height = data.props.height || defaults.height
  const projection = getProjection(data, width, height)

  const svg = xml.create('svg')
    .attr({ viewBox: `0 0 ${width} ${height}` })

  data.children.map(layer => {
    if (isKartoPolygon(layer)) {
      drawPolygon(svg, projection)(layer)
      return
    }
    if (isKartoPolygons(layer)) {
      drawPolygons(svg, projection)(layer)
      return
    }
    if (isKartoLine(layer)) {
      drawLine(svg, projection)(layer)
      return
    }
    if (isKartoLines(layer)) {
      drawLines(svg, projection)(layer)
      return
    }
    if (isKartoCircle(layer)) {
      drawCircle(svg, projection)(layer)
      return
    }
    if (isKartoCircles(layer)) {
      drawCircles(svg, projection)(layer)
      return
    }
  })

  return svg.outer()
}