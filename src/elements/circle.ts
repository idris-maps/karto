import { PointGeom, pointGeomSchema } from './geometries'
import { CircleStyle, circleStyleSchema } from './style'
import { validate } from './check'

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

export const validateKartoCircle = validate(kartoCircleSchema)