import { PointGeom, pointGeomSchema } from './geometries'
import { MarkerStyle, markerStyleSchema } from './style'
import { validate } from './check'

export interface MarkerProps extends MarkerStyle {
  geometry: PointGeom
}

export const markerPropsSchema = {
  type: 'object',
  properties: {
    geometry: pointGeomSchema,
    ...markerStyleSchema.properties,
  },
  required: [
    'geometry',
  ]
}

export interface KartoMarker {
  type: 'marker'
  props: MarkerProps
}

export const kartoMarkerSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['marker'] },
    props: markerPropsSchema,
  }
}

export const validateKartoMarker = validate(kartoMarkerSchema)