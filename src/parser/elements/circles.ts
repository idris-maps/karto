import Ajv from 'ajv'
import { PointGeom, pointGeomSchema } from './geometries'
import { CircleStyle, circleStyleSchema } from './style'

export interface CirclesProps extends CircleStyle {
  geometries: PointGeom[]
}

export const circlesPropsSchema = {
  type: 'object',
  properties: {
    geometries: { type: 'array', items: pointGeomSchema },
    ...circleStyleSchema.properties,
  },
  required: [
    'geometries',
  ]
}

export interface KartoCircles {
  type: 'circles'
  props: CirclesProps
}

export const kartoCirclesSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['circles'] },
    props: circlesPropsSchema,
  }
}

export const isKartoCircles = (d: any): d is KartoCircles => {
  const ajv = new Ajv()
  const isValid = ajv.validate(kartoCirclesSchema, d)
  return Boolean(isValid)
}