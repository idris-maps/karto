export type StrokeLinejoin = 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round'
export const strokeLinejoinSchema = {
  type: 'string',
  enum: ['arcs', 'bevel',  'miter',  'miter-clip',  'round'],
}

export type StrokeLinecap = 'butt' | 'round' | 'square'
export const strokeLinecapSchema = {
  type: 'string',
  enum: ['butt', 'round', 'square'],
}

export type TextAnchor = 'start' | 'middle' | 'end'
export const textAnchorSchema = {
  type: 'string',
  enum: ['start', 'middle', 'end'],
}

export interface CommonStyle {
  opacity?: number
}
export const commonStyleSchema = {
  type: 'object',
  properties: {
    opacity: { type: 'number', minimum: 0, maximum: 1 },
  }
}

export interface StrokeStyle extends CommonStyle {
  stroke?: string
  strokeWidth?: number
  strokeLinejoin?: StrokeLinejoin
  strokeDasharray?: number[]
  strokeDashoffset?: number
  strokeLinecap?: StrokeLinecap
  strokeOpacity?: number
}
export const strokeStyleSchema = {
  type: 'object',
  properties: {
    ...commonStyleSchema.properties,
    stroke: { type: 'string' },
    strokeWidth: { type: 'number' },
    strokeLinejoin: strokeLinejoinSchema,
    strokeDasharray: { type: 'array', items: { type: 'number' } },
    strokeDashoffset: { type: 'number'},
    strokeLinecap: strokeLinecapSchema,
    strokeOpacity: { type: 'number' }, 
  }
}

export interface FillStyle extends CommonStyle {
  fill?: string
  fillOpacity?: number
}
export const fillStyleSchema = {
  type: 'object',
  properties: {
    ...commonStyleSchema.properties,
    fill: { type: 'string' },
    fillOpacity: { type: 'number', minimum: 0, maximum: 1 },
  }
}

export interface TextStyle extends CommonStyle {
  fontFamily?: string
  fontSize?: number
  textAnchor?: TextAnchor
}
export const textStyleSchema = {
  type: 'object',
  properties: {
    ...commonStyleSchema.properties,
    fontFamily: { type: 'string' },
    fontSize: { type: 'number' },
    textAnchor: textAnchorSchema,
  }
}

// By layer

export interface LineStyle extends StrokeStyle {}
export const lineStyleSchema = strokeStyleSchema


export interface PolygonStyle extends StrokeStyle, FillStyle {}
export const polygonStyleSchema = {
  type: 'object',
  properties: {
    ...strokeStyleSchema.properties,
    ...fillStyleSchema.properties,
  }
}

export interface CircleStyle extends StrokeStyle, FillStyle {
  r: number
}
export const circleStyleSchema = {
  type: 'object',
  properties: {
    r: { type: 'number' },
    ...strokeStyleSchema.properties,
    ...fillStyleSchema.properties,  
  }
}