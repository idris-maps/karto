import { PathOptions } from 'leaflet'
import { StrokeStyle, FillStyle, StrokeLinejoin } from '../../parser/elements/style'
import { isNil } from 'ramda'

const fixLineJoin = (d?: StrokeLinejoin): "round" | "inherit" | "bevel" | "miter" | undefined => {
  // @ts-ignore
  if (['round', 'bevel', 'miter'].includes(d)) {
    // @ts-ignore
    return d
  }
  return undefined
}

interface StrokeAndFillStyle extends StrokeStyle, FillStyle {}
type Style = Partial<StrokeAndFillStyle>

export default (style: Style): PathOptions => {
  const d = {
    color: style.fill || style.stroke,
    dashArray: style.strokeDasharray,
    fill: Boolean(style.fill),
    fillColor: style.fill,
    fillOpacity: style.fillOpacity || 1,
    lineCap: style.strokeLinecap,
    lineJoin: fixLineJoin(style.strokeLinejoin),
    opacity: style.strokeOpacity || 1,
    stroke: Boolean(style.stroke),
    weight: style.strokeWidth,
  }
  // @ts-ignore
  return Object.keys(d).filter(key => !isNil(d[key]))
    // @ts-ignore
    .reduce((r, key) => ({ ...r, [key]: d[key] }), {})
}