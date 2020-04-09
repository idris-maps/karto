import decamelize from 'decamelize'

const toDash = (str: string) => decamelize(str, '-')

export default (props: any) =>
  Object.keys(props)
    .filter(d => d !== 'geometry' && d !== 'geometries')
    .map(key => ({ key: toDash(key), value: String(props[key]) }))