import { PointGeom, pointGeomSchema } from './geometries'
import { LabelStyle, labelStyleSchema } from './style'
import { validate } from './check'

export interface LabelProps extends LabelStyle {
  geometry: PointGeom
}

export const labelPropsSchema = {
  type: 'object',
  properties: {
    geometry: pointGeomSchema,
    ...labelStyleSchema.properties,
  },
  required: [
    'geometry',
  ]
}

export interface KartoLabel {
  type: 'label'
  props: LabelProps
}

export const kartoLabelSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['label'] },
    props: labelPropsSchema,
  }
}

export const validateKartoLabel = validate(kartoLabelSchema)
