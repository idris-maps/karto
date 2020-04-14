import { GeoProjection } from 'd3-geo'
import { KartoMarker } from '../../elements/marker'
import {
  setFillStyle,
  setStrokeStyle,
} from './canvasStyles'
import { marker } from '../svg/defs'

const drawMarker = (ctx: CanvasRenderingContext2D, layer: KartoMarker, x: number, y: number) => {
  const scale = (layer.props.width || 24) / 24
  const m = new Path2D(marker.d)

  ctx.save()
  ctx.translate(x - 12 * scale, y - 32 * scale)
  ctx.scale(scale, scale)

  if (layer.props.fill !== 'none') {
    setFillStyle(ctx, layer)(ctx => {
      ctx.fill(m)
    })
  }

  if (layer.props.stroke) {
    setStrokeStyle(ctx, layer)(ctx => {
      ctx.stroke(m)
    })
  }

  ctx.restore()

}

export default (ctx: CanvasRenderingContext2D, projection: GeoProjection) =>
  (layer: KartoMarker) => {

    const geometry = layer.props.geometry
    
    if (geometry.type === 'MultiPoint') {

      geometry.coordinates.map(point => {
        const pt = projection([point[0], point[1]])
        if (!pt) { return }
        drawMarker(ctx, layer, pt[0], pt[1])
        return
      })

    } else {

      const point = geometry.coordinates
      const pt = projection([point[0], point[1]])
      if (!pt) { return }
      drawMarker(ctx, layer, pt[0], pt[1])
      return

    }

  }