import { GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoLabel } from '../../elements/label'
import getStyle from '../utils/getStyle'

export default (svg: Tag, projection: GeoProjection) =>
  (label: KartoLabel) => {

    const style = getStyle(label.props)
      .filter(({ key }) => key !== 'text')
      .reduce((r, { key, value }) => ({ ...r, [key]: value }), {})
    const g = svg.child('g').attr(style)

    const geom = label.props.geometry
    if (geom.type === 'MultiPoint') {
      geom.coordinates.map(point => {
        // @ts-ignore
        const [x, y] = projection(point)
        g.child('text').attr({ x, y }).data(label.props.text)
      })
      return
    }
    // @ts-ignore
    const [x, y] = projection(geom.coordinates)
    g.child('text').attr({ x, y }).data(label.props.text)
  }