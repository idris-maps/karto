import { geoMercator } from 'd3-geo'
import { KartoMap } from '../../parser/elements/map'
import getGeometries from './getGeometries'

export default (map: KartoMap, width: number, height: number) => {
  if (map.props.projection) {
    return map.props.projection
  }
  return geoMercator().fitExtent(
    [[0, 0], [width, height]],
    { type: 'GeometryCollection', geometries: getGeometries(map) }
  )
}