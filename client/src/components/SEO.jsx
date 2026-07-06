import { useEffect } from 'react';

const upsertMeta = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const SEO = ({ title, description, jsonLd }) => {
  useEffect(() => {
    if (title) document.title = title;
    if (description) upsertMeta('description', description);

    const existing = document.getElementById('jsonld-current-page');
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'jsonld-current-page';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, jsonLd]);

  return null;
};

export default SEO;
