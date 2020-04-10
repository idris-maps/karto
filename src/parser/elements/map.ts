import Ajv from 'ajv'
import { GeoProjection } from 'd3-geo'
import { KartoLayer, kartoLayerSchemas } from './index'

export interface MapProps {
  width?: number
  height?: number
  projection?: GeoProjection
}

export const mapPropsSchema = {
  type: 'object',
  properties: {
    width: { type: 'number' },
    height: { type: 'number' },
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

export const isKartoMap = (d: any): d is KartoMap => {
  const ajv = new Ajv()
  const isValid = ajv.validate(kartoMapSchema, d)
  return Boolean(isValid)
}