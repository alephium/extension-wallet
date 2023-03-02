import * as yup from "yup"

export const tokenIdSchema = yup
  .string()
  .trim()
  .length(64)
  .required('Token id is required')
  .test((id, ctx) => {
    if (!id) {
      return ctx.createError({ message: 'Token id is required' })
    }

    if (!/^[0-9A-Za-z]+$/.test(id)) {
      return ctx.createError({ message: 'Invalid token Id' })
    }

    return true
  })

export const isValidTokenId = (id: string) =>
  tokenIdSchema.isValidSync(id)

export const isEqualTokenId = (a: string, b: string) => {
  return a === b
}
