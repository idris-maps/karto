import { GeoProjection } from 'd3-geo'
import { KartoTiles } from '../../elements/tiles'
import { getTileUrls, TileUrl } from '../utils/getTiles'

const addTile = (ctx: CanvasRenderingContext2D) =>
  async ({ x, y, size, url }: TileUrl) =>
    new Promise(resolve => {
      const image = new Image()
      image.src = url
      image.addEventListener('load', () => {
        ctx.drawImage(image, x, y, size, size)
        resolve()
      })
    })

export default (ctx: CanvasRenderingContext2D, projection: GeoProjection) =>
  async ({ props }: KartoTiles, [width, height]: [number, number]) => {
    const tileData = getTileUrls(projection, [width, height], props)
    return await Promise.all(tileData.map(addTile(ctx)))
  }