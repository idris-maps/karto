import { isKartoMap, KartoMap } from '../../parser/elements/map'
import getProjection from '../utils/getProjection'
import defaults from '../utils/defaults'

export default (data: any) => {
  if (!isKartoMap(data)) {
    throw new Error('Invalid karto definition')
  }
  const width = data.props.width || defaults.width
  const height = data.props.height || defaults.height
  const projection = getProjection(data, width, height)

}