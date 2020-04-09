import htm from '../../node_modules/htm/dist/htm'
import { isKartoElement, getKartoElementErrors } from './elements/index'

const h = (type: string, props: { [key: string]: string }, ...children: any[]) => {
  const element = { type, props: props || {}, children }
  if (!isKartoElement(element)) {
    throw new Error([
      `ERROR: invalid karto element`,
      JSON.stringify(element),
      getKartoElementErrors(element),
    ].join('\n\n'))
  }
  return element
}

export const karto = htm.bind(h)
