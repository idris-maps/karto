import htm from 'htm'
import { flatten } from 'ramda'
import { isKartoElement, KartoElement } from '../elements'

const h = (type: string, props: { [key: string]: string }, ...children: any[]): KartoElement => {
  const element = { type, props: props || {}, children: flatten(children) }
  if (!isKartoElement(element)) {
    throw new Error(`Type "${type}" is invalid`)
  }
  return element
}

export const karto = htm.bind(h)
