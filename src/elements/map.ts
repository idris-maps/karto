import { GeoProjection } from 'd3-geo'
import { KartoLayer, kartoLayerSchemas } from './index'
import { validate } from './check'

export interface MapProps {
  backgroundColor?: string
  height?: number
  projection?: GeoProjection
  width?: number
}

export const mapPropsSchema = {
  type: 'object',
  properties: {
    backgroundColor: { type: 'string' },
    height: { type: 'number' },
    width: { type: 'number' },
  },
}

export interface KartoMap {
  type: 'map'
  props: MapProps
  children: KartoLayer[]
}

export const kartoMapSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['map'] },
    props: mapPropsSchema,
    children: {
      type: 'array',
      items: {
        oneOf: kartoLayerSchemas,
      },
    },
  },
  required: ['type']
}

export const validateKartoMap = validate(kartoMapSchema)