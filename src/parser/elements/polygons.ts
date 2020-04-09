import Ajv from 'ajv'
import { PolygonGeom, polygonGeomSchema } from './geometries'
import { PolygonStyle, polygonStyleSchema } from './style'

export interface PolygonsProps extends PolygonStyle {
  geometries: PolygonGeom[]
}

export const polygonsPropsSchema = {
  type: 'object',
  properties: {
    geometries: { type: 'array', items: polygonGeomSchema },
    ...polygonStyleSchema.properties,
  },
  required: [
    'geometries',
  ]
}

export interface KartoPolygons {
  type: 'polygons'
  props: PolygonsProps
}

export const kartoPolygonsSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['polygons'] },
    props: polygonsPropsSchema,
  }
}

export const isKartoPolygons = (d: any): d is KartoPolygons => {
  const ajv = new Ajv()
  const isValid = ajv.validate(kartoPolygonsSchema, d)
  return Boolean(isValid)
}