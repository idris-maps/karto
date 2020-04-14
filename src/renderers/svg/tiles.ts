import { GeoProjection } from 'd3-geo'
import Tag from 'xml-string/dist/Tag'
import { KartoTiles } from '../../elements/tiles'
import getTiles from '../utils/getTiles'

export default (svg: Tag, projection: GeoProjection) =>
  async ({ props }: KartoTiles, [width, height]: [number, number]) => {
    const tileData = await getTiles(projection, [width, height], props)
    tileData.map(({ x, y, size, base64 }) => {
      svg.child('g')
        .attr({ transform: `translate(${x},${y})` })
        .child('image')
          .attr({
            width: size,
            height: size,
            'xlink:href': base64,
          })
    })
  }