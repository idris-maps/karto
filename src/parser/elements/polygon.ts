import { PolygonGeom, polygonGeomSchema } from './geometries'
import { PolygonStyle, polygonStyleSchema } from './style'
import { is, validate } from './check'

export interface PolygonProps extends PolygonStyle {
  geometry: PolygonGeom
}

export const polygonPropsSchema = {
  type: 'object',
  properties: {
    geometry: polygonGeomSchema,
    ...polygonStyleSchema.properties,
  },
  required: [
    'geometry',
  ]
}

export interface KartoPolygon {
  type: 'polygon'
  props: PolygonProps
}

export const kartoPolygonSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['polygon'] },
    props: polygonPropsSchema,
  }
}

export const isKartoPolygon = is<KartoPolygon>('polygon')

export const validateKartoPolygon = validate(kartoPolygonSchema)