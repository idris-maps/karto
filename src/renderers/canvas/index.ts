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
import drawCircle from './circle'
import drawLabel from './label'
import drawMarker from './marker'
import drawTiles from './tiles'
import { KartoTiles } from '../../elements/tiles'

export default async (elementId: string, data: any) => {

  const { isValid, error } = validate(data)
  if (!isValid && !isKartoMap(data)) {
    throw new Error(error)
  }

  const width = data.props.width || defaults.width
  const height = data.props.height || defaults.height
  const projection = getProjection(data, width, height)

  const ctx = getContext(elementId, width, height)

  const tiles: KartoTiles | undefined = data.children.find(isKartoTiles)
  if (tiles) {
    await drawTiles(ctx, projection)(tiles, [width, height])
  }

  const rest: KartoLayer[] = data.children.filter((d: KartoLayer) => !isKartoTiles(d))
  rest.map((layer: KartoLayer) => {
    if (isKartoPolygon(layer)) {
      return drawPolygon(ctx, projection)(layer)
    }
    if (isKartoLine(layer)) {
      return drawLine(ctx, projection)(layer)
    }

    if (isKartoCircle(layer)) {
      return drawCircle(ctx, projection)(layer)
    }
    if (isKartoLabel(layer)) {
      return drawLabel(ctx, projection)(layer)
    }
    if (isKartoMarker(layer)) {
      return drawMarker(ctx, projection)(layer)
    }
    return
  })

}