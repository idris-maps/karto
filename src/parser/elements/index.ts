import { KartoMap, kartoMapSchema, isKartoMap } from './map'
import { KartoPolygon, kartoPolygonSchema, isKartoPolygon as _isPolygon } from './polygon'
import { KartoLine, kartoLineSchema, isKartoLine as _isLine } from './line'
import { KartoCircle, kartoCircleSchema, isKartoCircle as _isCircle } from './circle'
import { KartoLabel, kartoLabelSchema, isKartoLabel as _isLabel } from './label'
import { KartoMarker, kartoMarkerSchema, isKartoMarker as _isMarker } from './marker'
import { KartoTiles, kartoTilesSchema, isKartoTiles as _isTiles } from './tiles'
import { validate } from './check'

export const isKartoPolygon = _isPolygon
export const isKartoLine = _isLine
export const isKartoCircle = _isCircle
export const isKartoLabel = _isLabel
export const isKartoMarker = _isMarker
export const isKartoTiles = _isTiles

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
