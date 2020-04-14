import { GeoProjection, geoPath } from 'd3-geo'
import { KartoPolygon } from '../../elements/polygon'
import {
  setFillStyle,
  setStrokeStyle,
} from './canvasStyles'

export default (ctx: CanvasRenderingContext2D, projection: GeoProjection) =>
  (layer: KartoPolygon) => {

    const pathCreator = geoPath().projection(projection)
    const path = pathCreator(layer.props.geometry)
    if (!path) { return }
    const canvasPath = new Path2D(path)

    if (layer.props.fill !== 'none') {
      setFillStyle(ctx, layer)(ctx => {
        ctx.fill(canvasPath)
      })
    }

    if (layer.props.stroke) {
      setStrokeStyle(ctx, layer)(ctx => {
        ctx.stroke(canvasPath)
      })
    }

    return

  }