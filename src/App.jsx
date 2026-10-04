import React from 'react';
import { HeartCrack } from 'lucide-react';
import { createPost, dislikePost, fetchPosts, likePost } from './api';
import { categories, fallbackEntries } from './constants';
import { EntryCard } from './EntryCard';
import {
  getDislikedPostIds,
  getLikedPostIds,
  saveDislikedPostIds,
  saveLikedPostIds,
} from './likes';
import { SubmissionModal } from './SubmissionModal';

function mergeEntries(currentEntries, incomingPosts) {
  const incomingIds = new Set(incomingPosts.map((post) => post.id));
  const currentById = new Map(currentEntries.map((entry) => [entry.id, entry]));
  const updatedPosts = incomingPosts.map((post) => ({ ...currentById.get(post.id), ...post }));
  const localOnlyEntries = currentEntries.filter(
    (entry) => entry.type !== 'system' && !incomingIds.has(entry.id),
  );

  return [...updatedPosts, ...localOnlyEntries];
}

export function App() {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [postedEntries, setPostedEntries] = React.useState([]);
  const [nextCursor, setNextCursor] = React.useState(null);
  const [feedVersion, setFeedVersion] = React.useState(null);
  const [hasMorePosts, setHasMorePosts] = React.useState(false);
  const [submissionStatus, setSubmissionStatus] = React.useState('idle');
  const [submissionMessage, setSubmissionMessage] = React.useState('');
  const [feedStatus, setFeedStatus] = React.useState('loading');
  const [historyStatus, setHistoryStatus] = React.useState('idle');
  const [likedPostIds, setLikedPostIds] = React.useState(() => getLikedPostIds());
  const [dislikedPostIds, setDislikedPostIds] = React.useState(() => getDislikedPostIds());
  const appName = import.meta.env.VITE_APP_NAME || 'WallOfBrokenPromises';

  React.useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      try {
        const result = await fetchPosts();

        if (!ignore) {
          setPostedEntries((current) => mergeEntries(current, result.posts));
          setNextCursor(result.nextCursor);
          setFeedVersion(result.version);
          setHasMorePosts(result.hasMore);
          setFeedStatus('ready');
        }
      } catch {
        if (!ignore) {
          setFeedStatus('error');
        }
      }
    }

    loadPosts();

    return () => {
      ignore = true;
    };
  }, []);

  const feedEntries = React.useMemo(
    () => (feedStatus === 'loading' ? postedEntries : [...postedEntries, ...fallbackEntries]),
    [feedStatus, postedEntries],
  );
  const visibleEntries =
    activeCategory === 'all'
      ? feedEntries
      : feedEntries.filter((entry) => entry.category === activeCategory);

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const story = String(form.get('story') || '').trim();
    const author = String(form.get('author') || '').trim() || 'Anonymous Victim';
    const category = String(form.get('category') || 'ghosted');

    if (!story) return;

    setSubmissionStatus('checking');
    setSubmissionMessage('');

    try {
      const post = await createPost({ story, author, category });

      setPostedEntries((current) => [
        {
          ...post,
          id: post.id || crypto.randomUUID(),
        },
        ...current,
      ]);
      formElement.reset();
      setSubmissionStatus('idle');
      setIsModalOpen(false);
    } catch (error) {
      setSubmissionStatus(error.result ? 'blocked' : 'error');
      setSubmissionMessage(
        error.result?.reason || 'Could not reach the safety check. Please try again.',
      );
    }
  }

  async function handleLoadMore() {
    if (!nextCursor || historyStatus === 'loading') {
      return;
    }

    setHistoryStatus('loading');

    try {
      const result = await fetchPosts({ before: nextCursor, version: feedVersion });

      setPostedEntries((current) => {
        const existingIds = new Set(current.map((entry) => entry.id));
        const newPosts = result.posts.filter((post) => !existingIds.has(post.id));
        return [...current, ...newPosts];
      });
      setNextCursor(result.nextCursor);
      setFeedVersion(result.version);
      setHasMorePosts(result.hasMore);
      setHistoryStatus('idle');
    } catch {
      setHistoryStatus('error');
    }
  }

  async function handleLike(entry) {
    if (likedPostIds.has(entry.id)) {
      return;
    }

    const nextLikedPostIds = new Set(likedPostIds);
    nextLikedPostIds.add(entry.id);
    setLikedPostIds(nextLikedPostIds);
    saveLikedPostIds(nextLikedPostIds);

    setPostedEntries((current) =>
      current.map((currentEntry) =>
        currentEntry.id === entry.id
          ? { ...currentEntry, count: Number(currentEntry.count || 0) + 1 }
          : currentEntry,
      ),
    );

    if (entry.type === 'system') {
      return;
    }

    try {
      const result = await likePost(entry.id);
      const updatedPost = result.post;

      setPostedEntries((current) =>
        current.map((currentEntry) =>
          currentEntry.id === updatedPost.id ? updatedPost : currentEntry,
        ),
      );
    } catch {
      setPostedEntries((current) =>
        current.map((currentEntry) =>
          currentEntry.id === entry.id
            ? { ...currentEntry, count: Math.max(0, Number(currentEntry.count || 0) - 1) }
            : currentEntry,
        ),
      );
      const rolledBackLikedPostIds = new Set(nextLikedPostIds);
      rolledBackLikedPostIds.delete(entry.id);
      setLikedPostIds(rolledBackLikedPostIds);
      saveLikedPostIds(rolledBackLikedPostIds);
    }
  }

  async function handleDislike(entry) {
    if (dislikedPostIds.has(entry.id)) {
      return;
    }

    const nextDislikedPostIds = new Set(dislikedPostIds);
    nextDislikedPostIds.add(entry.id);
    setDislikedPostIds(nextDislikedPostIds);
    saveDislikedPostIds(nextDislikedPostIds);

    setPostedEntries((current) =>
      current.map((currentEntry) =>
        currentEntry.id === entry.id
          ? {
              ...currentEntry,
              dislikeCount: Number(currentEntry.dislikeCount || 0) + 1,
            }
          : currentEntry,
      ),
    );

    if (entry.type === 'system') {
      return;
    }

    try {
      const result = await dislikePost(entry.id);

      if (result.deleted) {
        setPostedEntries((current) => current.filter((currentEntry) => currentEntry.id !== entry.id));
        return;
      }

      const updatedPost = result.post;
      setPostedEntries((current) =>
        current.map((currentEntry) =>
          currentEntry.id === updatedPost.id ? updatedPost : currentEntry,
        ),
      );
    } catch {
      setPostedEntries((current) =>
        current.map((currentEntry) =>
          currentEntry.id === entry.id
            ? {
                ...currentEntry,
                dislikeCount: Math.max(0, Number(currentEntry.dislikeCount || 0) - 1),
              }
            : currentEntry,
        ),
      );
      const rolledBackDislikedPostIds = new Set(nextDislikedPostIds);
      rolledBackDislikedPostIds.delete(entry.id);
      setDislikedPostIds(rolledBackDislikedPostIds);
      saveDislikedPostIds(rolledBackDislikedPostIds);
    }
  }

  function resetModal() {
    setSubmissionStatus('idle');
    setSubmissionMessage('');
    setIsModalOpen(false);
  }

  function handleOpenModal() {
    setSubmissionStatus('idle');
    setSubmissionMessage('');
    setIsModalOpen(true);
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <HeartCrack aria-hidden="true" />
            <h1>{appName}</h1>
          </div>
          <button className="primary-button" type="button" onClick={handleOpenModal}>
            <HeartCrack aria-hidden="true" />
            Spill The Tea
          </button>
        </div>
      </header>

      <main className="page-shell">
        <section className="intro">
          <h2>Left on Read? Flaked On?</h2>
          <p>
            An anonymous community board to vent about broken promises, sudden ghosting,
            and unreturned texts. Let it out safely.
          </p>
        </section>

        <div className="filters" aria-label="Filter entries">
          {Object.entries(categories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <button
                className={activeCategory === key ? 'filter active' : 'filter'}
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
              >
                {Icon ? <Icon aria-hidden="true" /> : null}
                {category.label}
              </button>
            );
          })}
        </div>

        {feedStatus === 'error' ? (
          <p className="feed-message">Live posts could not be loaded. Showing local entries for now.</p>
        ) : null}

        {feedStatus === 'loading' ? (
          <section className="feed" aria-label="Loading posts">
            {Array.from({ length: 6 }, (_, index) => (
              <article className="entry-card skeleton-card" key={index} />
            ))}
          </section>
        ) : (
          <section className="feed" aria-live="polite">
            {visibleEntries.map((entry) => (
              <EntryCard
                entry={entry}
                isDisliked={dislikedPostIds.has(entry.id)}
                isLiked={likedPostIds.has(entry.id)}
                key={entry.id}
                onDislike={handleDislike}
                onLike={handleLike}
              />
            ))}
          </section>
        )}

        {activeCategory === 'all' && hasMorePosts ? (
          <div className="load-more-row">
            <button
              className="ghost-button"
              disabled={historyStatus === 'loading'}
              type="button"
              onClick={handleLoadMore}
            >
              {historyStatus === 'loading' ? 'Loading...' : 'Load Older Posts'}
            </button>
          </div>
        ) : null}

        {historyStatus === 'error' ? (
          <p className="feed-message">Older posts could not be loaded. Please try again.</p>
        ) : null}
      </main>

      {isModalOpen ? (
        <SubmissionModal
          onClose={resetModal}
          onSubmit={handleSubmit}
          submissionMessage={submissionMessage}
          submissionStatus={submissionStatus}
        />
      ) : null}
    </>
  );
}
