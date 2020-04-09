import { GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoCircles } from '../../parser/elements/circles'
import getStyle from '../utils/getStyle'
import { isFeature } from '../utils/getGeometries'

export default (svg: Tag, projection: GeoProjection) =>
  (circles: KartoCircles) => {
    const g = svg.child('g')
      .attr(getStyle(circles.props).reduce((r, { key, value }) => ({ ...r, [key]: value }), {}))
    circles.props.geometries.map(circle => {
      const geom = isFeature(circle)
      ? circle.geometry
      : circle
      if (geom.type === 'MultiPoint') {
        geom.coordinates.map(point => {
          // @ts-ignore
          const [cx, cy] = projection(point)
          g.child('circle').attr({ cx, cy, r: circles.props.r })
        })
        return
      }
      // @ts-ignore
      const [cx, cy] = projection(geom.coordinates)
      g.child('circle').attr({ cx, cy, r: circles.props.r })
    })
  }