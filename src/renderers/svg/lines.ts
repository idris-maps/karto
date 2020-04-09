import { geoPath, GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoLines } from '../../parser/elements/lines'
import getStyle from '../utils/getStyle'

export default (svg: Tag, projection: GeoProjection) =>
  (lines: KartoLines) => {
    const pathCreator = geoPath().projection(projection)
    const style = [
      ...getStyle(lines.props),
      { key: 'fill', value: 'none' },
    ]
    const g = svg.child('g').attr(style.reduce((r, { key, value }) => ({ ...r, [key]: value }), {}))
    lines.props.geometries.map(geom => {
      g.child('path').attr({ d: String(pathCreator(geom)) })
    })
  }