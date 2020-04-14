import { GeoProjection } from 'd3-geo'
import { KartoLayer, kartoLayerSchemas } from './index'
import { is, validate } from './check'

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

export const isKartoMap = is<KartoMap>('map')

export const validateKartoMap = validate(kartoMapSchema)