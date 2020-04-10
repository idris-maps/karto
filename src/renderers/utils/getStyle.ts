import decamelize from 'decamelize'

const toDash = (str: string) => decamelize(str, '-')

const getKeyValue = (props: any) => (key: string) => {
  const value = props[key]
  if (key === 'translate') {
    return { key: 'transform', value: `translate(${value.join(',')})` }
  }
  return { key: toDash(key), value: String(props[key]) }
}

export default (props: any) =>
  Object.keys(props)
    .filter(d => d !== 'geometry')
    .map(getKeyValue(props))