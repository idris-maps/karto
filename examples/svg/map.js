const karto = require('karto').default
const renderSvgString = require('karto').renderSvgString
const countries = require('./countries.json')

// colors from https://colorbrewer2.org/#type=qualitative&scheme=Pastel2&n=7
const colors = [
  '#b3e2cd',
  '#fdcdac',
  '#cbd5e8',
  '#f4cae4',
  '#e6f5c9',
  '#fff2ae',
  '#f1e2cc',
]

const getColor = feature => 
  colors[feature.properties.mapcolor7 - 1]

const map = karto`
  <map width=${500} height=${500}>
    ${
      countries.map(feature =>
        karto`<polygon
          geometry=${feature.geometry}
          fill=${getColor(feature)}
          stroke="gray"
          />` 
      )
    }
  </map>
`

renderSvgString(map)
  .then(svg =>
    console.log(
      `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
      ${svg}`
    )
  )


