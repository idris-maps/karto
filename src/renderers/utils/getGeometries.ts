import { flatten } from 'ramda'
import { Feature, Geometry } from 'geojson'
import { KartoMap } from '../../parser/elements/map'
import { isKartoPolygon } from '../../parser/elements/polygon'
import { isKartoPolygons } from '../../parser/elements/polygons'
import { isKartoLine } from '../../parser/elements/line'
import { isKartoLines } from '../../parser/elements/lines'

export const isFeature = (d: any): d is Feature => d.type && d.type === 'Feature'
const getGeometryFromFeature = (d: Feature) => d.geometry
const getGeometry = (d: Geometry) => d

const getGeometriesByLayer = (layer: any): Geometry[] => {
  if (isKartoPolygon(layer)) {
    const geom = layer.props.geometry
    return [isFeature(geom) ? getGeometryFromFeature(geom) : getGeometry(geom)]
  }
  if (isKartoPolygons(layer)) {
    const geoms = layer.props.geometries
    return geoms.map(geom => isFeature(geom) ? getGeometryFromFeature(geom) : getGeometry(geom))
  }
  if (isKartoLine(layer)) {
    const geom = layer.props.geometry
    return [isFeature(geom) ? getGeometryFromFeature(geom) : getGeometry(geom)]
  }
  if (isKartoLines(layer)) {
    const geoms = layer.props.geometries
    return geoms.map(geom => isFeature(geom) ? getGeometryFromFeature(geom) : getGeometry(geom))
  }
  return []
}

export default (data: KartoMap) =>
  flatten(data.children.map(getGeometriesByLayer))