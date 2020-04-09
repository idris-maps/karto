import { Feature, Polygon, MultiPolygon, LineString, MultiLineString } from 'geojson'

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