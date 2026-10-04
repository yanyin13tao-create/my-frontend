const clientIdKey = 'minteaClientId';
const likedPostsKey = 'minteaLikedPosts';

export function getClientId() {
  const existingClientId = localStorage.getItem(clientIdKey);
  if (existingClientId) {
    return existingClientId;
  }

  const clientId = crypto.randomUUID();
  localStorage.setItem(clientIdKey, clientId);
  return clientId;
}

export function getLikedPostIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(likedPostsKey) || '[]'));
  } catch {
    return new Set();
  }
}

export function saveLikedPostIds(likedPostIds) {
  localStorage.setItem(likedPostsKey, JSON.stringify([...likedPostIds]));
}
