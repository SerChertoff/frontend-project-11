import './style.css';
import 'bootstrap';
import { proxy } from 'valtio/vanilla';
import { subscribeKey } from 'valtio/vanilla/utils';
import validateRssUrl from './validate';
import renderFormState from './view';

const form = document.querySelector('#rss-form');
const input = document.querySelector('#url-input');
const feedback = document.querySelector('#feedback');

const state = proxy({
  feeds: [],
  form: {
    status: 'filling',
    error: null,
  },
});

if (form && input && feedback) {
  const elements = { input, feedback };

  subscribeKey(state, 'form', () => {
    renderFormState(state, elements);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const url = formData.get('url');
    const existingUrls = state.feeds.map((feed) => feed.url);

    validateRssUrl(url, existingUrls)
      .then((validUrl) => {
        state.feeds.push({ url: validUrl });
        state.form = {
          status: 'success',
          error: null,
        };
        form.reset();
        input.focus();
      })
      .catch((error) => {
        state.form = {
          status: 'failed',
          error: error.message,
        };
      });
  });
}
