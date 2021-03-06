import xml from 'xml-string'
import getProjection from '../utils/getProjection'
import defaults from '../utils/defaults'
import validate from '../../validate'
import addDefs from './defs'

import {
  isKartoMap,
  isKartoCircle,
  isKartoLabel,
  isKartoLine,
  isKartoMarker,
  isKartoPolygon,
  isKartoTiles,
} from '../../elements'

import drawPolygon from './polygon'
import drawLine from './line'
import drawCircle from './circle'
import drawLabel from './label'
import drawMarker from './marker'
import drawTiles from './tiles'
import { KartoLayer } from '../../elements'

export default async (data: any) => {

  const { isValid, error } = validate(data)
  if (!isValid && !isKartoMap(data)) {
    throw new Error(error)
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

  if (data.props.backgroundColor) {
    svg.child('rect').attr({
      fill: data.props.backgroundColor,
      height,
      width,
    })
  }

  const tileLayer = svg.child('g')

  await Promise.all(data.children.map(async (layer: KartoLayer) => {
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
    if (isKartoTiles(layer)) {
      await drawTiles(tileLayer, projection)(layer, [width, height])
    }
  }))

  return svg.outer()
}