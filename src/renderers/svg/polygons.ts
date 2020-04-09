import { geoPath, GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoPolygons } from '../../parser/elements/polygons'
import getStyle from '../utils/getStyle'

export default (svg: Tag, projection: GeoProjection) =>
  (polygons: KartoPolygons) => {
    const pathCreator = geoPath().projection(projection)
    const style = getStyle(polygons.props)
    const g = svg.child('g').attr(style.reduce((r, { key, value }) => ({ ...r, [key]: value }), {}))
    polygons.props.geometries.map(geom => {
      g.child('path').attr({ d: String(pathCreator(geom)) })
    })
  }