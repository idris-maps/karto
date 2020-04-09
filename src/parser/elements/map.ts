import Ajv from 'ajv'
import { GeoProjection } from 'd3-geo'
import { KartoPolygon, kartoPolygonSchema } from './polygon'
import { KartoPolygons, kartoPolygonsSchema } from './polygons'
import { KartoLine, kartoLineSchema } from './line'
import { KartoLines, kartoLinesSchema } from './lines'

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
  children: Array<
    KartoPolygon
    | KartoPolygons
    | KartoLine
    | KartoLines
  >
}

export const kartoMapSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['map'] },
    props: mapPropsSchema,
    children: {
      type: 'array',
      items: {
        oneOf: [
          kartoPolygonSchema,
          kartoPolygonsSchema,
          kartoLineSchema,
          kartoLinesSchema,
        ],
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