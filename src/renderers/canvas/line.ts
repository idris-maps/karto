import { GeoProjection, geoPath } from 'd3-geo'
import { KartoLine } from '../../elements/line'
import { setStrokeStyle } from './canvasStyles'

export default (ctx: CanvasRenderingContext2D, projection: GeoProjection) =>
  (layer: KartoLine) => {

    const pathCreator = geoPath().projection(projection)
    const path = pathCreator(layer.props.geometry)
    if (!path) { return }
    const canvasPath = new Path2D(path)

    if (layer.props.stroke) {
      setStrokeStyle(ctx, layer)(ctx => {
        ctx.stroke(canvasPath)
      })
    }

    return

  }