import { 
  Polygon,
  MultiPolygon,
  LineString,
  MultiLineString,
  Point,
  MultiPoint,
} from 'geojson'


export type PolygonGeom = Polygon | MultiPolygon
export const polygonGeomSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['Polygon', 'MultiPolygon'] },
  },
  required: ['type']
}

export type LineGeom = LineString | MultiLineString
export const lineGeomSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['LineString', 'MultiLineString'] },
  },
  required: ['type']
}

export type PointGeom = Point | MultiPoint
export const pointGeomSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['Point', 'MultiPoint'] },
  },
  required: ['type']
}