import React from 'react';
import { HeartCrack } from 'lucide-react';
import { createPost, fetchPosts, likePost } from './api';
import { categories, fallbackEntries } from './constants';
import { EntryCard } from './EntryCard';
import { getLikedPostIds, saveLikedPostIds } from './likes';
import { SubmissionModal } from './SubmissionModal';

export function App() {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [postedEntries, setPostedEntries] = React.useState(fallbackEntries);
  const [submissionStatus, setSubmissionStatus] = React.useState('idle');
  const [submissionMessage, setSubmissionMessage] = React.useState('');
  const [feedStatus, setFeedStatus] = React.useState('loading');
  const [likedPostIds, setLikedPostIds] = React.useState(() => getLikedPostIds());
  const appName = import.meta.env.VITE_APP_NAME || 'WallOfBrokenPromises';

  React.useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      try {
        const posts = await fetchPosts();

        if (!ignore) {
          setPostedEntries([...posts, ...fallbackEntries]);
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

  const visibleEntries =
    activeCategory === 'all'
      ? postedEntries
      : postedEntries.filter((entry) => entry.category === activeCategory);

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

        <section className="feed" aria-live="polite">
          {visibleEntries.map((entry) => (
            <EntryCard
              entry={entry}
              isLiked={likedPostIds.has(entry.id)}
              key={entry.id}
              onLike={handleLike}
            />
          ))}
        </section>
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
