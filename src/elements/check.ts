import Ajv from 'ajv'

export const is = <T>(type: string) => (d: any): d is T =>
  d && d.type && d.type === type

export interface Validation {
  isValid: boolean | PromiseLike<any>
  errorText: string
  errors: Ajv.ErrorObject[] | null | undefined
}

export type Validator = (d: any) => Validation

export const validate = (schema: any): Validator => (d: any): Validation => {
  const ajv = new Ajv()
  const isValid = ajv.validate(schema, d)
  return {
    isValid,
    errorText: ajv.errorsText(),
    errors: ajv.errors,
  }
}