import Ajv from 'ajv'
import { KartoMap, kartoMapSchema } from './map'
import { KartoPolygon, kartoPolygonSchema } from './polygon'
import { KartoLine, kartoLineSchema } from './line'
import { KartoCircle, kartoCircleSchema } from './circle'
import { KartoLabel, kartoLabelSchema } from './label'
import { KartoMarker, kartoMarkerSchema } from './marker'

export type KartoLayer = KartoPolygon
  | KartoLine
  | KartoCircle
  | KartoLabel
  | KartoMarker

export type KartoElement = KartoMap | KartoLayer

export const kartoLayerSchemas = [
  kartoPolygonSchema,
  kartoLineSchema,
  kartoCircleSchema,
  kartoLabelSchema,
  kartoMarkerSchema,
]

export const kartoElementSchema = {
  oneOf: [
    kartoMapSchema,
    ...kartoLayerSchemas,
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