import htm from '../../node_modules/htm/dist/htm'
import { flatten } from 'ramda'
import Ajv from 'ajv'
import { isKartoElement, getKartoElementErrors } from './elements/index'
import { isKartoMap, kartoMapSchema } from './elements/map'
import { isKartoPolygon, kartoPolygonSchema } from './elements/polygon'
import { isKartoPolygons, kartoPolygonsSchema } from './elements/polygons'
import { isKartoLine, kartoLineSchema } from './elements/line'
import { isKartoLines, kartoLinesSchema } from './elements/lines'

const schemaByType: { [key: string]: any } = {
  'map': kartoMapSchema,
  'polygon': kartoPolygonSchema,
  'polygons': kartoPolygonsSchema,
  'line': kartoLineSchema,
  'lines': kartoLinesSchema,
}

const getErrors = (schema: any, element: any) => {
  const ajv = new Ajv()
  const isValid = ajv.validate(schema, element)
  return {
    isValid,
    errors: ajv.errors,
    errorText: ajv.errorsText()
  }
}

const h = (type: string, props: { [key: string]: string }, ...children: any[]) => {
  const element = { type, props: props || {}, children: flatten(children) }
  if (!isKartoElement(element)) {
    const schema: any | undefined = schemaByType[type]
    if (!schema) {
      throw new Error(`Type "${type}" is invalid`)
    }
    const { isValid, errors, errorText } = getErrors(schema, element)
    if (!isValid) {
      throw new Error([
        `ERROR: invalid karto element`,
        JSON.stringify(element),
        JSON.stringify(errors, null, 2),
        errorText,
      ].join('\n\n'))
    }
  }
  return element
}

export const karto = htm.bind(h)
