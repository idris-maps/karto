import Ajv from 'ajv'

export const is = <T>(type: string) => (d: any): d is T =>
  d && d.type && d.type === type

export const validate = (schema: any) => (d: any) => {
  const ajv = new Ajv()
  const isValid = ajv.validate(schema, d)
  return {
    isValid,
    errorText: ajv.errorsText(),
    errors: ajv.errors,
  }
}