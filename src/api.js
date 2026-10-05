const fileServiceBaseUrl = (import.meta.env.VITE_FILE_SERVICE_URL || '').replace(/\/$/, '');

export async function fetchPosts({ before, limit = 50, version } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });

  if (before) {
    params.set('before', before);
  }

  if (version && !before) {
    params.set('version', version);
  }

  const response = await fetch(`/api/posts?${params.toString()}`);
  const result = await response.json();

  if (!response.ok || !Array.isArray(result.posts)) {
    throw new Error('Invalid posts response.');
  }

  return result;
}

export async function createPost({ story, author, category, attachments = [] }) {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story, author, category, attachments }),
  });
  const result = await response.json();

  if (!response.ok || !result.approved) {
    const error = new Error(result.reason || 'This post cannot be published.');
    error.result = result;
    throw error;
  }

  return result.post;
}

export async function fetchComments(postId, { before, limit = 25 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });

  if (before) {
    params.set('before', before);
  }

  const response = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments?${params.toString()}`);
  const result = await response.json();

  if (!response.ok || !Array.isArray(result.comments)) {
    throw new Error(result.error || 'Invalid comments response.');
  }

  return result;
}

export async function createComment(postId, { body, author, attachments = [] }) {
  const response = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, author, attachments }),
  });
  const result = await response.json();

  if (!response.ok || !result.approved) {
    const error = new Error(result.reason || result.error || 'This comment cannot be published.');
    error.result = result;
    throw error;
  }

  return result.comment;
}

export async function uploadFile(file) {
  const response = await fetch(`${fileServiceBaseUrl}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': file.name || 'upload',
    },
    body: file,
  });
  const result = await response.json();

  if (!response.ok || !result.file?.id) {
    throw new Error(result.error || 'Could not upload this image.');
  }

  return result.file;
}

export async function likePost(id) {
  const response = await fetch(`/api/posts/${encodeURIComponent(id)}/like`, {
    method: 'POST',
  });
  const result = await response.json();

  if (!response.ok || !result.post) {
    throw new Error(result.error || 'Could not like this post.');
  }

  return result;
}

export async function dislikePost(id) {
  const response = await fetch(`/api/posts/${encodeURIComponent(id)}/dislike`, {
    method: 'POST',
  });
  const result = await response.json();

  if (!response.ok || (!result.post && !result.deleted)) {
    throw new Error(result.error || 'Could not dislike this post.');
  }

  return result;
}
