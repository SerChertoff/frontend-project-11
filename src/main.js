import './style.css'
import 'bootstrap'
import { proxy } from 'valtio/vanilla'
import { subscribe } from 'valtio/vanilla'
import validateRssUrl from './validate'
import render from './view'
import { loadRss, NETWORK_ERROR, PARSE_ERROR } from './rss'
import initI18n from './i18n'
import i18next from 'i18next'

const form = document.querySelector('#rss-form')
const input = document.querySelector('#url-input')
const feedback = document.querySelector('#feedback')
const feeds = document.querySelector('#feeds')
const posts = document.querySelector('#posts')
const submitButton = form?.querySelector('button[type="submit"]')
const modalTitle = document.querySelector('#postModalLabel')
const modalBody = document.querySelector('#postModalBody')
const modalReadMore = document.querySelector('#postModalReadMore')
const modalCloseButton = document.querySelector('#postModalClose')

const errorKeys = {
  [NETWORK_ERROR]: 'errors.network',
  [PARSE_ERROR]: 'errors.parse',
}
const UPDATE_INTERVAL_MS = 5000

const state = proxy({
  feeds: [],
  posts: [],
  form: {
    status: 'filling',
    error: null,
  },
  ui: {
    readPostIds: [],
    modalPostId: null,
  },
})

const localizeInterface = () => {
  document.title = i18next.t('app.title')
  const title = document.querySelector('h1')
  const description = document.querySelector('header .lead')
  const rssLabel = document.querySelector('label[for="url-input"]')
  const example = document.querySelector('main section .text-muted')
  const feedsTitle = document.querySelector('#feeds')?.closest('.card')?.querySelector('h2')
  const postsTitle = document.querySelector('#posts')?.closest('.card')?.querySelector('h2')

  if (title) {
    title.textContent = i18next.t('app.title')
  }

  if (description) {
    description.textContent = i18next.t('app.description')
  }

  if (rssLabel) {
    rssLabel.textContent = i18next.t('app.rssLabel')
  }

  if (input) {
    input.setAttribute('aria-label', i18next.t('app.rssAriaLabel'))
  }

  if (submitButton) {
    submitButton.textContent = i18next.t('app.submit')
  }

  if (example) {
    example.textContent = i18next.t('app.example')
  }

  if (feedsTitle) {
    feedsTitle.textContent = i18next.t('app.feeds')
  }

  if (postsTitle) {
    postsTitle.textContent = i18next.t('app.posts')
  }

  if (modalCloseButton) {
    modalCloseButton.textContent = i18next.t('app.close')
  }

  if (modalReadMore) {
    modalReadMore.textContent = i18next.t('app.readMore')
  }
}

const getNewPosts = (existingLinks, loadedPosts) => loadedPosts.filter((post) => {
  if (existingLinks.has(post.link)) {
    return false
  }

  existingLinks.add(post.link)
  return true
})

const collectNewPosts = (currentPosts, results) => {
  const existingLinks = new Set(currentPosts.map(post => post.link))

  return results
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => getNewPosts(existingLinks, result.value.posts))
}

const updateFeeds = (watchedState) => {
  const requests = watchedState.feeds.map(feed => loadRss(feed.url))

  Promise.allSettled(requests)
    .then((results) => {
      const newPosts = collectNewPosts(watchedState.posts, results)

      if (newPosts.length > 0) {
        watchedState.posts.unshift(...newPosts)
      }
    })
    .finally(() => {
      setTimeout(() => updateFeeds(watchedState), UPDATE_INTERVAL_MS)
    })
}

const markPostAsRead = (watchedState, postId) => {
  if (!watchedState.ui.readPostIds.includes(postId)) {
    watchedState.ui.readPostIds.push(postId)
  }
}

const runApp = () => {
  if (
    !form
    || !input
    || !feedback
    || !feeds
    || !posts
    || !submitButton
    || !modalTitle
    || !modalBody
    || !modalReadMore
    || !modalCloseButton
  ) {
    return
  }

  localizeInterface()

  const elements = {
    input,
    feedback,
    feeds,
    posts,
    submitButton,
    modalTitle,
    modalBody,
    modalReadMore,
    modalCloseButton,
  }

  subscribe(state, () => {
    render(state, elements)
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const url = formData.get('url')
    const existingUrls = state.feeds.map(feed => feed.url)

    state.form = {
      status: 'sending',
      error: null,
    }

    validateRssUrl(url, existingUrls)
      .then(validUrl => loadRss(validUrl).then(rss => ({ validUrl, rss })))
      .then(({ validUrl, rss }) => {
        const feedData = {
          ...rss.feed,
          url: validUrl,
        }
        state.feeds.push(feedData)
        state.posts.unshift(...rss.posts)
      })
      .catch((error) => {
        state.form = {
          status: 'failed',
          error: i18next.t(errorKeys[error.message] ?? error.message),
        }
      })
      .finally(() => {
        if (state.form.status !== 'failed') {
          state.form = {
            status: 'success',
            error: null,
          }
          form.reset()
          input.focus()
        }
      })
  })

  posts.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const triggerElement = target.closest('[data-id]')
    if (!triggerElement) {
      return
    }

    const { id } = triggerElement.dataset
    if (!id) {
      return
    }

    markPostAsRead(state, id)

    if (triggerElement.tagName === 'BUTTON') {
      state.ui.modalPostId = id
    }
  })

  render(state, elements)
  updateFeeds(state)
}

initI18n().then(runApp)
