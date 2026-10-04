const likedPostsKey = 'minteaLikedPosts';
const dislikedPostsKey = 'minteaDislikedPosts';

function getSavedPostIds(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch {
    return new Set();
  }
}

function savePostIds(key, postIds) {
  localStorage.setItem(key, JSON.stringify([...postIds]));
}

export function getLikedPostIds() {
  return getSavedPostIds(likedPostsKey);
}

export function saveLikedPostIds(likedPostIds) {
  savePostIds(likedPostsKey, likedPostIds);
}

export function getDislikedPostIds() {
  return getSavedPostIds(dislikedPostsKey);
}

export function saveDislikedPostIds(dislikedPostIds) {
  savePostIds(dislikedPostsKey, dislikedPostIds);
}
