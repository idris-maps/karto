import { KartoMap } from '../../parser/elements/map'
import { getBboxGeom } from './getProjection'
import { LatLngBoundsExpression } from 'leaflet'

export default (map: KartoMap): LatLngBoundsExpression => {
  const [xMin, yMin, xMax, yMax] = getBboxGeom(map)
  return [
    [yMin, xMin],
    [yMax, xMax]
  ]
}