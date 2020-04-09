import { Feature, Polygon, MultiPolygon } from 'geojson'

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