import { GeoProjection, geoPath } from 'd3-geo'
import { KartoCircle } from '../../elements/circle'
import {
  setFillStyle,
  setStrokeStyle,
} from './canvasStyles'

const drawCircle = (ctx: CanvasRenderingContext2D, layer: KartoCircle, x: number, y: number, r: number) => {

  if (layer.props.fill !== 'none') {
    setFillStyle(ctx, layer)(ctx => {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  if (layer.props.stroke) {
    setStrokeStyle(ctx, layer)(ctx => {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
    })
  }

}

export default (ctx: CanvasRenderingContext2D, projection: GeoProjection) =>
  (layer: KartoCircle) => {

    const geometry = layer.props.geometry
    const r = layer.props.r

    if (geometry.type === 'MultiPoint') {

      geometry.coordinates.map(point => {
        const pt = projection([point[0], point[1]])
        if (!pt) { return }
        drawCircle(ctx, layer, pt[0], pt[1], r)
        return
      })

    } else {

      const point = geometry.coordinates
      const pt = projection([point[0], point[1]])
      if (!pt) { return }
      drawCircle(ctx, layer, pt[0], pt[1], r)
      return

    }

  }