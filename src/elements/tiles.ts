import { TilesStyle, tilesStyleSchema } from './style'
import { is, validate } from './check'

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

export const isKartoTiles = is<KartoTiles>('tiles')

export const validateKartoTiles = validate(kartoTilesSchema)