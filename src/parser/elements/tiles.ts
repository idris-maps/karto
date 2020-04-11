import Ajv from 'ajv'
import { TilesStyle, tilesStyleSchema } from './style'

export interface TilesProps extends TilesStyle {
}

export const tilesPropsSchema = tilesStyleSchema


export interface KartoTiles {
  type: 'tiles'
  props: TilesProps
}

export const kartoTilesSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['tiles'] },
    props: tilesPropsSchema,
  }
}

export const isKartoTiles = (d: any): d is KartoTiles => {
  const ajv = new Ajv()
  const isValid = ajv.validate(kartoTilesSchema, d)
  return Boolean(isValid)
}