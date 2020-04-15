import karto from 'karto'
import renderToCanvas from 'karto/dist/renderers/canvas'
import { geoOrthographic, geoGraticule10 } from 'd3-geo'
import land from './land.json'

let rotation = 0

const step = () => {
  rotation = rotation > 360 ? 1 : rotation + 1
  const map = karto`
    <map projection=${geoOrthographic().rotate([rotation, -10, -10])}>
      <polygon geometry=${land.features[0]} />
      <line geometry=${geoGraticule10()} stroke="gray" />
    </map>
  `
  renderToCanvas('map', map)
  requestAnimationFrame(step)
}

step()
