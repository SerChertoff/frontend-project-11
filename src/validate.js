import * as yup from 'yup';

const schema = yup.string().trim().required('Не должно быть пустым').url('Ссылка должна быть валидным URL');

const validateRssUrl = (url, existingUrls) => schema
  .notOneOf(existingUrls, 'RSS уже существует')
  .validate(url);

export default validateRssUrl;
