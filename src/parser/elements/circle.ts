import Ajv from 'ajv'
import { PointGeom, pointGeomSchema } from './geometries'
import { CircleStyle, circleStyleSchema } from './style'

export interface CircleProps extends CircleStyle {
  geometry: PointGeom
}

export const circlePropsSchema = {
  type: 'object',
  properties: {
    geometry: pointGeomSchema,
    ...circleStyleSchema.properties,
  },
  required: [
    'geometry',
  ]
}

export interface KartoCircle {
  type: 'circle'
  props: CircleProps
}

export const kartoCircleSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['circle'] },
    props: circlePropsSchema,
  }
}

export const isKartoCircle = (d: any): d is KartoCircle => {
  const ajv = new Ajv()
  const isValid = ajv.validate(kartoCircleSchema, d)
  return Boolean(isValid)
}