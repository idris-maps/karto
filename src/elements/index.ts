import { KartoMap, kartoMapSchema } from './map'
import { KartoPolygon, kartoPolygonSchema } from './polygon'
import { KartoLine, kartoLineSchema } from './line'
import { KartoCircle, kartoCircleSchema } from './circle'
import { KartoLabel, kartoLabelSchema } from './label'
import { KartoMarker, kartoMarkerSchema } from './marker'
import { KartoTiles, kartoTilesSchema } from './tiles'
import { validate, is } from './check'

export const isKartoMap = is<KartoMap>('map')
export const isKartoPolygon = is<KartoPolygon>('polygon')
export const isKartoLine = is<KartoLine>('line')
export const isKartoCircle = is<KartoCircle>('circle')
export const isKartoLabel = is<KartoLabel>('label')
export const isKartoMarker = is<KartoMarker>('marker')
export const isKartoTiles = is<KartoTiles>('tiles')

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
