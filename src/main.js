import './style.css';
import 'bootstrap';

const form = document.querySelector('#rss-form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
}
