import i18next from 'i18next'
import ru from './locales/ru'

const initI18n = () => i18next.init({
  lng: 'ru',
  debug: false,
  resources: {
    ru,
  },
})

export default initI18n