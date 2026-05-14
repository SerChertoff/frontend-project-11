import * as yup from 'yup'

const schema = yup
  .string()
  .trim()
  .required('errors.required')
  .url('errors.invalidUrl')

const validateRssUrl = (url, existingUrls) => schema
  .notOneOf(existingUrls, 'errors.duplicate')
  .validate(url)

export default validateRssUrl
