import { karto } from './parser'
import _renderSvgString from './renderers/svg'
import _validateMapDefinition from './validate'

export default karto
export const renderSvgString = _renderSvgString
export const validateMapDefinition = _validateMapDefinition
