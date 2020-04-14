import test from 'ava'
import validate from '../../src/validate'
import { karto } from '../../src/parser'

const lineGeometry = {"type":"LineString","coordinates":[[6.6497981,46.7810757],[6.6498774,46.7811741],[6.649893,46.7811935],[6.6499575,46.7812967]]}

test('validate map definition', t => {
  const mapProp = validate(karto`<map width="hello"></map>`)
  t.is(mapProp.error, '<map> property width should be number')

  const missingKey = validate(karto`
    <map>
      <tiles />
    </map>
  `)
  t.is(missingKey.error, '<tiles> should have required property \'url\'')

  const missingGeom = validate(karto`
    <map>
      <line />
    </map>
  `)
  t.is(missingGeom.error, '<line> should have required property \'geometry\'')

  const invalidGeometry = validate(karto`
    <map>
      <polygon geometry=${lineGeometry} />
    </map>
  `)
  t.is(invalidGeometry.error, '<polygon>.geometry.type should be equal to one of the allowed values')

  const invalidKey = validate(karto`
    <map>
      <line geometry=${lineGeometry} strokeDasharray="hello" />
    </map>
  `)
  t.is(invalidKey.error, '<line>.strokeDasharray should be array')

})