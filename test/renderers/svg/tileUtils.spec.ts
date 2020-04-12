import test from 'ava'
import { getTileUrl } from '../../../src/renderers/utils/getTiles'

const urlAfterServer = (url: string) =>
  url.split('.').filter((d, i) => i !== 0).join('.')

test('getTileUrl', t => {
  const getMapnikTile = getTileUrl({ url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' })
  const mapnikTile = getMapnikTile([0, 0, 0])
  t.is(urlAfterServer(mapnikTile), 'tile.openstreetmap.org/0/0/0.png')

  const getStamenTile = getTileUrl({
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}',
    subdomains: 'abcd',
    ext: 'png',
  })
  const stamenTile = getStamenTile([0, 0, 0])
  t.is(urlAfterServer(stamenTile), 'a.ssl.fastly.net/toner/0/0/0.png')

  const getCartoDbTile = getTileUrl({
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
  })
  const cartoDbTile = getCartoDbTile([0, 0, 0])
  t.is(urlAfterServer(cartoDbTile), 'basemaps.cartocdn.com/light_nolabels/0/0/0.png')

})
