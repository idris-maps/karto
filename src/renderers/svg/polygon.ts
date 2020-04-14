import { geoPath, GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoPolygon } from '../../elements/polygon'
import getStyle from '../utils/getStyle'

export default (svg: Tag, projection: GeoProjection) =>
  (polygon: KartoPolygon) => {
    const pathCreator = geoPath().projection(projection)
    const g = svg.child('g')
    const path = g.child('path')
    const attributes = [
      ...getStyle(polygon.props),
      { key: 'd', value: String(pathCreator(polygon.props.geometry)) }
    ]
    path.attr(attributes.reduce((r, { key, value }) => ({ ...r, [key]: value }), {}))
  }