const likedPostsKey = 'minteaLikedPosts';

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
