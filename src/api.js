export async function fetchPosts() {
  const response = await fetch('/api/posts');
  const result = await response.json();

  if (!response.ok || !Array.isArray(result.posts)) {
    throw new Error('Invalid posts response.');
  }

  return result.posts;
}

export async function createPost({ story, author, category }) {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story, author, category }),
  });
  const result = await response.json();

  if (!response.ok || !result.approved) {
    const error = new Error(result.reason || 'This post cannot be published.');
    error.result = result;
    throw error;
  }

  return result.post;
}

export async function likePost(id, clientId) {
  const response = await fetch(`/api/posts/${encodeURIComponent(id)}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  });
  const result = await response.json();

  if (!response.ok || !result.post) {
    throw new Error(result.error || 'Could not like this post.');
  }

  return result;
}
