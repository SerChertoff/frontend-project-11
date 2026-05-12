const NETWORK_ERROR = 'networkError';
const PARSE_ERROR = 'parseError';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const parseRss = (xmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'application/xml');
  const parserError = doc.querySelector('parsererror');

  if (parserError) {
    throw new Error(PARSE_ERROR);
  }

  const channelTitle = doc.querySelector('channel > title')?.textContent?.trim();
  const channelDescription = doc.querySelector('channel > description')?.textContent?.trim();

  if (!channelTitle || !channelDescription) {
    throw new Error(PARSE_ERROR);
  }

  const posts = Array.from(doc.querySelectorAll('item')).map((item) => ({
    id: generateId(),
    title: item.querySelector('title')?.textContent?.trim() ?? '',
    description: item.querySelector('description')?.textContent?.trim() ?? '',
    link: item.querySelector('link')?.textContent?.trim() ?? '#',
  })).filter((post) => post.title && post.description);

  return {
    feed: {
      id: generateId(),
      title: channelTitle,
      description: channelDescription,
    },
    posts,
  };
};

const loadRss = async (url) => {
  const response = await fetch(getProxyUrl(url)).catch(() => {
    throw new Error(NETWORK_ERROR);
  });

  if (!response.ok) {
    throw new Error(NETWORK_ERROR);
  }

  const data = await response.json().catch(() => {
    throw new Error(PARSE_ERROR);
  });

  if (!data.contents) {
    throw new Error(PARSE_ERROR);
  }

  return parseRss(data.contents);
};

export { loadRss, NETWORK_ERROR, PARSE_ERROR };