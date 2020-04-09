const collection = require('./nyc.json')

import { karto } from './src/parser'
import toSvg from './src/renderers/svg'

const map = karto`
  <map>
    <polygons geometries=${collection.features} fill="red" stroke="green" strokeWidth=${5} />
  </map>
`
   
console.log(toSvg(map))
