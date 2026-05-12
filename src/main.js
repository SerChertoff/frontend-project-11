import './style.css';
import 'bootstrap';
import { proxy } from 'valtio/vanilla';
import { subscribe } from 'valtio/vanilla';
import validateRssUrl from './validate';
import render from './view';
import { loadRss, NETWORK_ERROR, PARSE_ERROR } from './rss';
import initI18n from './i18n';
import i18next from 'i18next';

const form = document.querySelector('#rss-form');
const input = document.querySelector('#url-input');
const feedback = document.querySelector('#feedback');
const feeds = document.querySelector('#feeds');
const posts = document.querySelector('#posts');
const submitButton = form?.querySelector('button[type="submit"]');

const errorKeys = {
  [NETWORK_ERROR]: 'errors.network',
  [PARSE_ERROR]: 'errors.parse',
};

const state = proxy({
  feeds: [],
  posts: [],
  form: {
    status: 'filling',
    error: null,
  },
});

const localizeInterface = () => {
  document.title = i18next.t('app.title');
  const title = document.querySelector('h1');
  const description = document.querySelector('header .lead');
  const rssLabel = document.querySelector('label[for="url-input"]');
  const example = document.querySelector('main section .text-muted');
  const feedsTitle = document.querySelector('#feeds')?.closest('.card')?.querySelector('h2');
  const postsTitle = document.querySelector('#posts')?.closest('.card')?.querySelector('h2');

  if (title) {
    title.textContent = i18next.t('app.title');
  }

  if (description) {
    description.textContent = i18next.t('app.description');
  }

  if (rssLabel) {
    rssLabel.textContent = i18next.t('app.rssLabel');
  }

  if (input) {
    input.setAttribute('aria-label', i18next.t('app.rssAriaLabel'));
  }

  if (submitButton) {
    submitButton.textContent = i18next.t('app.submit');
  }

  if (example) {
    example.textContent = i18next.t('app.example');
  }

  if (feedsTitle) {
    feedsTitle.textContent = i18next.t('app.feeds');
  }

  if (postsTitle) {
    postsTitle.textContent = i18next.t('app.posts');
  }
};

const runApp = () => {
  if (!form || !input || !feedback || !feeds || !posts || !submitButton) {
    return;
  }

  localizeInterface();

  const elements = {
    input,
    feedback,
    feeds,
    posts,
    submitButton,
  };

  subscribe(state, () => {
    render(state, elements);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const url = formData.get('url');
    const existingUrls = state.feeds.map((feed) => feed.url);

    state.form = {
      status: 'sending',
      error: null,
    };

    validateRssUrl(url, existingUrls)
      .then((validUrl) => loadRss(validUrl).then((rss) => ({ validUrl, rss })))
      .then(({ validUrl, rss }) => {
        const feedData = {
          ...rss.feed,
          url: validUrl,
        };
        state.feeds.push(feedData);
        state.posts.unshift(...rss.posts);
      })
      .catch((error) => {
        state.form = {
          status: 'failed',
          error: i18next.t(errorKeys[error.message] ?? error.message),
        };
      })
      .finally(() => {
        if (state.form.status !== 'failed') {
          state.form = {
            status: 'success',
            error: null,
          };
          form.reset();
          input.focus();
        }
      });
  });

  render(state, elements);
};

initI18n().then(runApp);
