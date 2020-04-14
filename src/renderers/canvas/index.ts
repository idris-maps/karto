import getProjection from '../utils/getProjection'
import defaults from '../utils/defaults'
import validate from '../../validate'
import getContext from './getContext'

import {
  KartoLayer,
  isKartoMap,
  isKartoCircle,
  isKartoLabel,
  isKartoLine,
  isKartoMarker,
  isKartoPolygon,
  isKartoTiles,
} from '../../elements'

import drawPolygon from './polygon'
import drawLine from './line'
/*
import drawCircle from './circle'
import drawLabel from './label'
import drawMarker from './marker'
import drawTiles from './tiles'
*/

export default async (elementId: string, data: any) => {

  const { isValid, error } = validate(data)
  if (!isValid && !isKartoMap(data)) {
    throw new Error(error)
  }

  const width = data.props.width || defaults.width
  const height = data.props.height || defaults.height
  const projection = getProjection(data, width, height)

  const ctx = getContext(elementId, width, height)

  await Promise.all(data.children.map(async (layer: KartoLayer) => {
    if (isKartoPolygon(layer)) {
      return drawPolygon(ctx, projection)(layer)
    }
    if (isKartoLine(layer)) {
      return drawLine(ctx, projection)(layer)
    }
    /*
    if (isKartoCircle(layer)) {
      drawCircle(svg, projection)(layer)
      return
    }
    if (isKartoLabel(layer)) {
      drawLabel(svg, projection)(layer)
      return
    }
    if (isKartoMarker(layer)) {
      drawMarker(svg, projection)(layer)
      return
    }
    if (isKartoTiles(layer)) {
      await drawTiles(tileLayer, projection)(layer, [width, height])
    }
    */
  }))
}