import { geoMercator } from 'd3-geo'
import { KartoMap } from '../../parser/elements/map'
import { Geometry, Position, BBox, Polygon } from 'geojson'
import { pipe, map } from 'ramda'

const POINT_MARGIN = 0.001

const getGeometries = (map: KartoMap) =>
  map.children.map(layer => layer.props.geometry)

const flat = <T>(arr: T[][]): T[] =>
  arr.reduce((r, c) => ([ ...r, ...c ]), [])

const getPositions = (geometry: Geometry): Position[] => {
  if (geometry.type === 'Point') {
    return [geometry.coordinates]
  }
  if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
    return geometry.coordinates
  }
  if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
    return flat(geometry.coordinates)
  }
  if (geometry.type === 'MultiPolygon') {
    return flat(flat(geometry.coordinates))
  }
  return []
}

const getBbox = (positions: Position[]): BBox => {
  const start: BBox = [Infinity, Infinity, -Infinity, -Infinity]
  const reducer = ([xMin, yMin, xMax, yMax]: BBox, [x, y]: Position): BBox => ([
    x < xMin ? x : xMin,
    y < yMin ? y : yMin,
    x > xMax ? x : xMax,
    y > yMax ? y : yMax,
  ])
  return positions.reduce(reducer, start)
}

const fixIfPoint = ([xMin, yMin, xMax, yMax]: BBox): BBox => {
  if (xMin === xMax || yMin === yMax) {
    return [
      xMin - POINT_MARGIN,
      yMin - POINT_MARGIN,
      xMax + POINT_MARGIN,
      yMax + POINT_MARGIN,
    ]
  }
  return [xMin, yMin, xMax, yMax]
}

const bboxToGeom = ([xMin, yMin, xMax, yMax]: BBox): Polygon => ({
  type: 'Polygon',
  coordinates: [[
    [xMin, yMin],
    [xMin, yMax],
    [xMax, yMax],
    [xMax, yMin],
    [xMin, yMin],
  ]]
}) 

const getBboxGeom = pipe(
  getGeometries,
  map(getPositions),
  flat,
  getBbox,
  fixIfPoint,
  bboxToGeom
)

export default (map: KartoMap, width: number, height: number) => {
  if (map.props.projection) {
    return map.props.projection
  }
  return geoMercator().fitExtent(
    [[0, 0], [width, height]],
    getBboxGeom(map)
  )
}