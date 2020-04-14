import {
  FillStyle,
  StrokeStyle,
  TextStyle,
  StrokeLinejoin,
  TextAnchor,
  fillStyleSchema,
  textStyleSchema,
  strokeStyleSchema,
} from '../../elements/style'
import { KartoPolygon } from '../../elements/polygon'
import { keys, pick } from 'ramda'
import { KartoCircle } from '../../elements/circle'
import { KartoLabel } from '../../elements/label'
import { KartoMarker } from '../../elements/marker'
import { KartoLine } from '../../elements/line'

export type Draw = (ctx: CanvasRenderingContext2D) => void

type FillLayer = KartoPolygon | KartoCircle | KartoLabel | KartoMarker

const getFillStyle = (layer: FillLayer): FillStyle =>
  pick(keys(fillStyleSchema.properties), layer.props)

export const setFillStyle = (ctx: CanvasRenderingContext2D, layer: FillLayer) =>
  (draw: Draw) => {

    ctx.save()

    const style = getFillStyle(layer)

    if (style.fill) {
      ctx.fillStyle = style.fill || 'black'
    }
    if (style.opacity) {
      if (style.fillOpacity) {
        ctx.globalAlpha = style.fillOpacity
      } else {
        ctx.globalAlpha = style.opacity
      }
    }

    draw(ctx)

    ctx.restore()

}

const isCanvasLineJoin = (lineJoin: string): lineJoin is CanvasLineJoin =>
  ['bevel', 'miter', 'round'].includes(lineJoin)

const convertLineJoin = (svgLineJoin: StrokeLinejoin): CanvasLineJoin | undefined => {
  if (isCanvasLineJoin(svgLineJoin)) {
    return svgLineJoin
  }
  if (svgLineJoin === 'miter-clip') {
    return 'miter'
  }
  return undefined
}

type StrokeLayer = KartoPolygon | KartoCircle | KartoLabel | KartoMarker | KartoLine

const getStrokeStyle = (layer: StrokeLayer): StrokeStyle =>
  pick(keys(strokeStyleSchema.properties), layer.props)

export const setStrokeStyle = (ctx: CanvasRenderingContext2D, layer: StrokeLayer) =>
  (draw: Draw) => {

    ctx.save()

    const style = getStrokeStyle(layer)

    if (style.opacity) {
      if (style.strokeOpacity) {
        ctx.globalAlpha = style.strokeOpacity
      } else {
        ctx.globalAlpha = style.opacity
      }
    }
    if (style.stroke) {
      ctx.strokeStyle = style.stroke
    }
    if (style.strokeDasharray) {
      ctx.setLineDash(style.strokeDasharray)
    }
    if (style.strokeDashoffset) {
      ctx.lineDashOffset = style.strokeDashoffset
    }
    if (style.strokeLinecap) {
      ctx.lineCap = style.strokeLinecap
    }
    if (style.strokeLinejoin) {
      const lineJoin = convertLineJoin(style.strokeLinejoin)
      if (lineJoin) {
        ctx.lineJoin = lineJoin
      }
    }
    if (style.strokeWidth) {
      ctx.lineWidth = style.strokeWidth
    }

    draw(ctx)

    ctx.restore()

}

const isCanvasTextAlign = (align: string): align is CanvasTextAlign =>
  ['center', 'end', 'left', 'right', 'start'].includes(align)

const convertTextAlign = (align: TextAnchor): CanvasTextAlign => {
  if (isCanvasTextAlign(align)) {
    return align
  }
  return 'center'
}

type TextLayer = KartoLabel

const getTextStyle = (layer: TextLayer): TextStyle =>
  pick(keys(textStyleSchema.properties), layer.props)

export const setTextStyle = (ctx: CanvasRenderingContext2D, layer: TextLayer) =>
  (draw: Draw) => {

    ctx.save()

    const style = getTextStyle(layer)

    if (style.fontFamily || style.fontSize) {
      const size = `${style.fontSize || 10}px`
      const font = style.fontFamily || 'serif'
      ctx.font = `${size} ${font}`
    }
    if (style.opacity) {
      ctx.globalAlpha = style.opacity
    }
    if (style.textAnchor) {
      ctx.textAlign = convertTextAlign(style.textAnchor)
    }

    draw(ctx)
  
    ctx.restore()

  }