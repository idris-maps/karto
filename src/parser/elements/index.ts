import Ajv from 'ajv'
import { KartoMap, kartoMapSchema } from './map'
import { KartoPolygon, kartoPolygonSchema } from './polygon'
import { KartoPolygons, kartoPolygonsSchema } from './polygons'

export type KartoElement = KartoMap
  | KartoPolygon
  | KartoPolygons

export const kartoElementSchema = {
  oneOf: [
    kartoMapSchema,
    kartoPolygonSchema,
    kartoPolygonsSchema,
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