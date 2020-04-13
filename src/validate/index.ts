import { path } from 'ramda'
import { validateKartoMap } from '../parser/elements/map'
import { validateKartoCircle } from '../parser/elements/circle'
import { validateKartoLabel } from '../parser/elements/label'
import { validateKartoLine } from '../parser/elements/line'
import { validateKartoMarker } from '../parser/elements/marker'
import { validateKartoPolygon } from '../parser/elements/polygon'
import { validateKartoTiles } from '../parser/elements/tiles'
import { Validator } from '../parser/elements/check'

interface Error {
  isValid: boolean
  error?: string
}

const validateByType: { [key: string]: Validator } = {
  circle: validateKartoCircle,
  label: validateKartoLabel,
  line: validateKartoLine,
  marker: validateKartoMarker,
  polygon: validateKartoPolygon,
  tiles: validateKartoTiles
}

export default (data: any): Error => {
  const { isValid, errorText } = validateKartoMap(data)
  if (isValid) {
    return { isValid: true }
  }
  if (errorText.startsWith('data.props')) {
    return { isValid, error: `<map> property ${errorText.split('data.props.')[1]}` }
  }
  if (errorText.startsWith('data.children')) {
    const childIndex = errorText.split('data.children[')[1].split(']')[0]
    const element = path(['children', childIndex], data)
    const type: string | undefined = path(['type'], element)
    if (!type) {
      return { isValid, error: errorText }
    }
    const validator = validateByType[type]
    if (!validator) {
      return { isValid, error: errorText }
    }
    const err = validator(element)
    return { isValid, error: `<${type}>${err.errorText.split('data.props')[1] }` }
  }
  return { isValid, error: errorText }
}