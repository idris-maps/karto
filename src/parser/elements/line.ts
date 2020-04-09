import Ajv from 'ajv'
import { LineGeom, lineGeomSchema } from './geometries'
import { LineStyle, lineStyleSchema } from './style'

export interface LineProps extends LineStyle {
  geometry: LineGeom
}

export const linePropsSchema = {
  type: 'object',
  properties: {
    geometry: lineGeomSchema,
    ...lineStyleSchema.properties,
  },
  required: [
    'geometry',
  ]
}

export interface KartoLine {
  type: 'line'
  props: LineProps
}

export const kartoLineSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['line'] },
    props: linePropsSchema,
  }
}

export const isKartoLine = (d: any): d is KartoLine => {
  const ajv = new Ajv()
  const isValid = ajv.validate(kartoLineSchema, d)
  return Boolean(isValid)
}