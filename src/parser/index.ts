import htm from '../../node_modules/htm/dist/htm'
import { flatten } from 'ramda'
import Ajv from 'ajv'
import { isKartoElement } from './elements/index'
import { kartoMapSchema } from './elements/map'
import { kartoPolygonSchema } from './elements/polygon'
import { kartoPolygonsSchema } from './elements/polygons'
import { kartoLineSchema } from './elements/line'
import { kartoLinesSchema } from './elements/lines'
import { kartoCircleSchema } from './elements/circle'
import { kartoCirclesSchema } from './elements/circles'

const schemaByType: { [key: string]: any } = {
  'map': kartoMapSchema,
  'polygon': kartoPolygonSchema,
  'polygons': kartoPolygonsSchema,
  'line': kartoLineSchema,
  'lines': kartoLinesSchema,
  'circle': kartoCircleSchema,
  'circles': kartoCirclesSchema,
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
