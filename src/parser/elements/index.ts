import Ajv from 'ajv'
import { KartoMap, kartoMapSchema } from './map'
import { KartoPolygon, kartoPolygonSchema } from './polygon'
import { KartoPolygons, kartoPolygonsSchema } from './polygons'
import { KartoLine, kartoLineSchema } from './line'
import { KartoLines, kartoLinesSchema } from './lines'
import { KartoCircle, kartoCircleSchema } from './circle'
import { KartoCircles, kartoCirclesSchema } from './circles'

export type KartoElement = KartoMap
  | KartoPolygon
  | KartoPolygons
  | KartoLine
  | KartoLines
  | KartoCircle
  | KartoCircles

export const kartoElementSchema = {
  oneOf: [
    kartoMapSchema,
    kartoPolygonSchema,
    kartoPolygonsSchema,
    kartoLineSchema,
    kartoLinesSchema,
    kartoCircleSchema,
    kartoCirclesSchema,
  ]
}

export const isKartoElement = (d: any): d is KartoElement => {
  const ajv = new Ajv()
  const isValid = ajv.validate(kartoElementSchema, d)
  return Boolean(isValid) 
}

export const getKartoElementErrors = (d: any) => {
  const ajv = new Ajv()
  ajv.validate(kartoElementSchema, d)
  return ajv.errors ? JSON.stringify(ajv.errors, null, 2) : ''
}