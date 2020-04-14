import { GeoProjection } from 'd3-geo'
import { Position } from 'geojson'
import { KartoLabel } from '../../elements/label'
import {
  setFillStyle,
  setStrokeStyle,
  setTextStyle,
} from './canvasStyles'

const drawLabel = (ctx: CanvasRenderingContext2D, layer: KartoLabel, x: number, y: number) => {

  const text = layer.props.text

  setTextStyle(ctx, layer)(ctx => {

    if (layer.props.fill !== 'none') {
      setFillStyle(ctx, layer)(ctx => {
        ctx.fillText(text, x, y)
      })
    }
  
    if (layer.props.stroke) {
      setStrokeStyle(ctx, layer)(ctx => {
        ctx.strokeText(text, x, y)
      })
    }

  })

}

const getPosition = (projection: GeoProjection, point: Position, translate?: number[]) => {
  const pt = projection([point[0], point[1]])
  if (!pt) { return [-Infinity, -Infinity] }
  const translateX = translate ? translate[0] : 0
  const translateY = translate ? translate[1] : 0
  return [
    translateX + pt[0],
    translateY + pt[1],
  ]
}

export default (ctx: CanvasRenderingContext2D, projection: GeoProjection) =>
  (layer: KartoLabel) => {

    const geometry = layer.props.geometry
    const translate = layer.props.translate

    if (geometry.type === 'MultiPoint') {

      geometry.coordinates.map(point => {
        const [x, y] = getPosition(projection, point, translate)
        drawLabel(ctx, layer, x, y)
        return
      })

    } else {

      const [x, y] = getPosition(projection, geometry.coordinates, translate)
      drawLabel(ctx, layer, x, y)
      return

    }

  }