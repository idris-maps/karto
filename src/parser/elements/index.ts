import { KartoMap, kartoMapSchema, isKartoMap } from './map'
import { KartoPolygon, kartoPolygonSchema, isKartoPolygon } from './polygon'
import { KartoLine, kartoLineSchema, isKartoLine } from './line'
import { KartoCircle, kartoCircleSchema, isKartoCircle } from './circle'
import { KartoLabel, kartoLabelSchema, isKartoLabel } from './label'
import { KartoMarker, kartoMarkerSchema, isKartoMarker } from './marker'
import { KartoTiles, kartoTilesSchema, isKartoTiles } from './tiles'
import { validate } from './check'

export type KartoLayer = KartoPolygon
  | KartoLine
  | KartoCircle
  | KartoLabel
  | KartoMarker
  | KartoTiles

export type KartoElement = KartoMap | KartoLayer

export const kartoLayerSchemas = [
  kartoPolygonSchema,
  kartoLineSchema,
  kartoCircleSchema,
  kartoLabelSchema,
  kartoMarkerSchema,
  kartoTilesSchema,
]

export const kartoElementSchema = {
  oneOf: [
    kartoMapSchema,
    ...kartoLayerSchemas,
  ]
}

export const isKartoElement = (d: any): d is KartoElement =>
  isKartoCircle(d)
  || isKartoLabel(d)
  || isKartoLine(d)
  || isKartoMap(d)
  || isKartoMarker(d)
  || isKartoPolygon(d)
  || isKartoTiles(d)
  

export const validateKartoElement = validate(kartoElementSchema)
