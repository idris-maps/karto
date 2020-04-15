import karto from 'karto'
import renderToLeaflet from 'karto/dist/renderers/leaflet'
import airports from './airports.json'

const map = karto`
  <map>
    <tiles
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution=${'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
      />
    ${
      airports.map(geometry =>
        karto`<marker geometry=${geometry} fill="lightcoral" stroke="indianred" width=${40}/>`
      )
    }
  </map>
`

renderToLeaflet('map', map)
