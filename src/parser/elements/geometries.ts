import { Feature, Polygon, MultiPolygon, LineString, MultiLineString, Point, MultiPoint } from 'geojson'

const featureSchema = (geometrySchema: any) => ({
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['Feature'] },
    geometry: geometrySchema,
  },
  required: ['type']
})


export type PolygonGeom = Polygon | MultiPolygon | Feature<Polygon> | Feature<MultiPolygon>
const polygonGeometrySchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['Polygon', 'MultiPolygon'] },
  },
  required: ['type']
}
export const polygonGeomSchema = {
  oneOf: [
    polygonGeometrySchema,
    featureSchema(polygonGeometrySchema),
  ],
}

export type LineGeom = LineString | MultiLineString | Feature<LineString> | Feature<MultiLineString>
const lineGeometrySchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['LineString', 'MultiLineString'] },
  },
  required: ['type']
}
export const lineGeomSchema = {
  oneOf: [
    lineGeometrySchema,
    featureSchema(lineGeometrySchema),
  ],
}

export type PointGeom = Point | MultiPoint | Feature<Point> | Feature<MultiPoint>
const pointGeometrySchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['Point', 'MultiPoint'] },
  },
  required: ['type']
}
export const pointGeomSchema = {
  oneOf: [
    pointGeometrySchema,
    featureSchema(pointGeometrySchema),
  ],
}