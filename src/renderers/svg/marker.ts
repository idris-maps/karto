import { GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoMarker } from '../../parser/elements/marker'
import getStyle from '../utils/getStyle'

export default (svg: Tag, projection: GeoProjection) =>
  (marker: KartoMarker) => {

    const style = getStyle(marker.props)
      .filter(({ key }) => key !== 'width')
      .reduce((r, { key, value }) => ({ ...r, [key]: value }), {})

    const geom = marker.props.geometry
    if (geom.type === 'MultiPoint') {
      const g = svg.child('g').attr(style)
      geom.coordinates.map(point => {
        // @ts-ignore
        const [x, y] = projection(point)
        const transform = marker.props.width
          ? `translate(${x},${y}) scale(${marker.props.width / 24})`
          : `translate(${x},${y})`
        g.child('g').attr({ transform })
          .child('use').attr({ 'xlink:href': '#marker' })
      })
      return
    }
    const g = svg.child('g').attr(style)
    // @ts-ignore
    const [x, y] = projection(geom.coordinates)
    const transform = marker.props.width
      ? `translate(${x},${y}) scale(${marker.props.width / 24})`
      : `translate(${x},${y})`
    g.child('g').attr({ transform })
      .child('use').attr({ 'xlink:href': '#marker' })
  }