import { geoPath, GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoLine } from '../../elements/line'
import getStyle from '../utils/getStyle'

export default (svg: Tag, projection: GeoProjection) =>
  (line: KartoLine) => {
    const pathCreator = geoPath().projection(projection)
    const g = svg.child('g')
    const path = g.child('path')
    const attributes = [
      ...getStyle(line.props),
      { key: 'fill', value: 'none' },
      { key: 'd', value: String(pathCreator(line.props.geometry)) }
    ]
    path.attr(attributes.reduce((r, { key, value }) => ({ ...r, [key]: value }), {}))
  }