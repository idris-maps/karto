// @ts-ignore
import { tile } from 'd3-tile'
import { GeoProjection } from 'd3-geo'
import axios from 'axios'

type Tile = [number, number, number]
interface TileConfig {
  translate: [number, number]
  scale: number
}
interface TilePosition {
  tile: Tile
  x: number
  y: number
  size: number
}

export const getTiles = (projection: GeoProjection, [width, height]: [number, number]): TilePosition[] => {
  const tiles = tile()
    .size([width, height])
    .scale(projection.scale() * 2 * Math.PI)
    .translate(projection.translate().map(Math.round))
  return tiles().map(([x, y, z]: Tile, i: number, {translate: [tx, ty], scale: k}: TileConfig) => ({
    tile: [x, y, z],
    x: (x + tx) * k,
    y: (y + ty) * k,
    size: k,
  }))
}

interface UrlParts {
  url: string
  subdomains?: string
  ext?: string
}

const defaultUrlParts = {
  subdomains: 'abc',
  ext: 'png'
}

export const getTileUrl = ({ url, subdomains, ext }: UrlParts) =>
  ([x, y, z]: Tile) => {
    const sub = subdomains || defaultUrlParts.subdomains
    const extension = ext || defaultUrlParts.ext
    const s = Array.from(sub)[Math.floor(Math.random() * sub.length)]
    return url
      .split('{x}').join(String(x))
      .split('{y}').join(String(y))
      .split('{z}').join(String(z))
      .split('{s}').join(s)
      .split('{ext}').join(extension)
      .split('{r}').join('')
  }

interface TileUrl extends TilePosition {
  url: string
}
export const getTileUrls = (
  projection: GeoProjection,
  canvasSize: [number, number],
  props: UrlParts
): TileUrl[] => {
  const tiles = getTiles(projection, canvasSize)
  const getUrl = getTileUrl(props)
  return tiles.map(d => ({ ...d, url: getUrl(d.tile) }))
}

interface TileBase64 extends TileUrl {
  base64: string
}

export const getTileBase64 = (ext?: string) =>
  async (tile: TileUrl): Promise<TileBase64> => {
    const res = await axios.get(tile.url, { responseType: 'arraybuffer' })
    const b64 = Buffer.from(res.data, 'binary').toString('base64')
    return {
      ...tile,
      base64: `data:image/${ext || 'png'};base64,${b64}`
    }
  }

export default (
  projection: GeoProjection,
  [width, height]: [number, number],
  { url, subdomains, ext }: UrlParts
) =>
  Promise.all(
    getTileUrls(projection, [width, height], { url, subdomains, ext })
      .map(getTileBase64(ext))
  )

