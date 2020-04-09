import { GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoCircle } from '../../parser/elements/circle'
import getStyle from '../utils/getStyle'
import { isFeature } from '../utils/getGeometries'

export default (svg: Tag, projection: GeoProjection) =>
  (circle: KartoCircle) => {
    const g = svg.child('g')
      .attr(getStyle(circle.props).reduce((r, { key, value }) => ({ ...r, [key]: value }), {}))
    const geom = isFeature(circle.props.geometry)
      ? circle.props.geometry.geometry
      : circle.props.geometry
    if (geom.type === 'MultiPoint') {
      geom.coordinates.map(point => {
        // @ts-ignore
        const [cx, cy] = projection(point)
        g.child('circle').attr({ cx, cy, r: circle.props.r })
      })
      return
    }
    // @ts-ignore
    const [cx, cy] = projection(geom.coordinates)
    g.child('circle').attr({ cx, cy, r: circle.props.r })
  }