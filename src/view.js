const renderFormState = (state, elements) => {
  const { input, feedback } = elements;
  const { form } = state;

  if (form.status === 'failed') {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = form.error;
    return;
  }

  if (form.status === 'success') {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = 'RSS успешно загружен';
    return;
  }

  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger', 'text-success');
  feedback.textContent = '';
};

export default renderFormState;
