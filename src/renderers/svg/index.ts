import xml from 'xml-string'
import { isKartoMap } from '../../parser/elements/map'
import { isKartoPolygon } from '../../parser/elements/polygon'
import getProjection from '../utils/getProjection'
import defaults from '../utils/defaults'
import drawPolygon from './polygon'

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
  })

  return svg.outer()
}