import { GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoCircle } from '../../elements/circle'
import getStyle from '../utils/getStyle'

export default (svg: Tag, projection: GeoProjection) =>
  (circle: KartoCircle) => {

    const style = getStyle(circle.props)
      .filter(({ key }) => key !== 'r')
      .reduce((r, { key, value }) => ({ ...r, [key]: value }), {})
    const g = svg.child('g').attr(style)

    const geom = circle.props.geometry
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