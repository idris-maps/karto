import Ajv from 'ajv'
import { LineGeom, lineGeomSchema } from './geometries'
import { LineStyle, lineStyleSchema } from './style'

export interface LinesProps extends LineStyle {
  geometries: LineGeom[]
}

export const linesPropsSchema = {
  type: 'object',
  properties: {
    geometries: { type: 'array', items: lineGeomSchema },
    ...lineStyleSchema.properties,
  },
  required: [
    'geometries',
  ]
}

export interface KartoLines {
  type: 'lines'
  props: LinesProps
}

export const kartoLinesSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['lines'] },
    props: linesPropsSchema,
  }
}

export const isKartoLines = (d: any): d is KartoLines => {
  const ajv = new Ajv()
  const isValid = ajv.validate(kartoLinesSchema, d)
  return Boolean(isValid)
}