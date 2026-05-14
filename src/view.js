import i18next from 'i18next'

const renderFeeds = (feeds, container) => {
  container.innerHTML = ''

  feeds.forEach((feed) => {
    const item = document.createElement('li')
    item.classList.add('list-group-item', 'border-0', 'border-end-0')

    const title = document.createElement('h3')
    title.classList.add('h6', 'm-0')
    title.textContent = feed.title

    const description = document.createElement('p')
    description.classList.add('m-0', 'small', 'text-black-50')
    description.textContent = feed.description

    item.append(title, description)
    container.append(item)
  })
}

const renderPosts = (posts, container) => {
  container.innerHTML = ''

  posts.forEach((post) => {
    const item = document.createElement('li')
    item.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
    )

    const link = document.createElement('a')
    link.href = post.link
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.classList.add(post.isRead ? 'fw-normal' : 'fw-bold')
    if (post.isRead) {
      link.classList.add('link-secondary')
    }
    link.textContent = post.title
    link.dataset.id = post.id

    const description = document.createElement('p')
    description.classList.add('m-0', 'small', 'text-black-50', 'w-100', 'pt-2')
    description.textContent = post.description

    const body = document.createElement('div')
    body.classList.add('me-2')
    body.append(link, description)

    const previewButton = document.createElement('button')
    previewButton.type = 'button'
    previewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm')
    previewButton.dataset.id = post.id
    previewButton.dataset.bsToggle = 'modal'
    previewButton.dataset.bsTarget = '#modal'
    previewButton.textContent = i18next.t('app.preview')

    item.append(body, previewButton)
    container.append(item)
  })
}

const renderModal = (state, elements) => {
  const { modalTitle, modalBody, modalReadMore, modalCloseButton } = elements
  const { modalPostId } = state.ui
  const currentPost = state.posts.find(post => post.id === modalPostId)

  modalCloseButton.textContent = i18next.t('app.close')
  modalReadMore.textContent = i18next.t('app.readMore')

  if (!currentPost) {
    modalTitle.textContent = ''
    modalBody.textContent = ''
    modalReadMore.href = '#'
    return
  }

  modalTitle.textContent = currentPost.title
  modalBody.textContent = currentPost.description
  modalReadMore.href = currentPost.link
}

const renderFormState = (state, elements) => {
  const { input, feedback, submitButton } = elements
  const { form } = state

  submitButton.disabled = form.status === 'sending'

  if (form.status === 'failed') {
    input.classList.add('is-invalid')
    feedback.classList.remove('text-success')
    feedback.classList.add('text-danger')
    feedback.textContent = form.error
    return
  }

  if (form.status === 'success') {
    input.classList.remove('is-invalid')
    feedback.classList.remove('text-danger')
    feedback.classList.add('text-success')
    feedback.textContent = i18next.t('app.success')
    return
  }

  input.classList.remove('is-invalid')
  feedback.classList.remove('text-danger', 'text-success')
  feedback.textContent = ''
}

const render = (state, elements) => {
  renderFormState(state, elements)
  renderFeeds(state.feeds, elements.feeds)
  const postsWithReadState = state.posts.map(post => ({
    ...post,
    isRead: state.ui.readPostIds.includes(post.id),
  }))
  renderPosts(postsWithReadState, elements.posts)
  renderModal(state, elements)
}

export default render
