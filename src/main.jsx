import React from 'react';
import { createRoot } from 'react-dom/client';
import { HeartCrack, MessageSquareWarning, Pizza, Flag, X } from 'lucide-react';
import './styles.css';

const categories = {
  all: { label: 'All Entries' },
  ghosted: { label: 'Ghosted', icon: MessageSquareWarning },
  redFlag: { label: 'Massive Red Flags', icon: Flag },
  flaked: { label: 'Promised & Flaked', icon: Pizza },
};

const entries = [
  {
    id: 1,
    category: 'ghosted',
    time: '2 hours ago',
    author: 'Anonymous Victim',
    count: 42,
    story:
      'Swore up and down they wanted to grab coffee this weekend, locked in the exact time and place... then unadded me on everything 30 minutes before arrival. Classic.',
  },
  {
    id: 2,
    category: 'redFlag',
    time: 'Yesterday',
    author: 'DevSurvivor',
    count: 89,
    story:
      'Talked for 3 weeks about building a joint project together. Turned out they just wanted me to debug their entire codebase for free and vanished.',
  },
  {
    id: 3,
    category: 'flaked',
    time: '3 days ago',
    author: 'Timeless Wanderer',
    count: 124,
    story:
      "Said 'let me check my schedule' and I am still waiting in the void of space-time continuum.",
  },
];

function App() {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [postedEntries, setPostedEntries] = React.useState(entries);
  const [submissionStatus, setSubmissionStatus] = React.useState('idle');
  const [submissionMessage, setSubmissionMessage] = React.useState('');
  const [feedStatus, setFeedStatus] = React.useState('loading');
  const appName = import.meta.env.VITE_APP_NAME || 'WallOfBrokenPromises';

  React.useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      try {
        const response = await fetch('/api/posts');
        const result = await response.json();

        if (!response.ok || !Array.isArray(result.posts)) {
          throw new Error('Invalid posts response.');
        }

        if (!ignore) {
          setPostedEntries([...result.posts, ...entries]);
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
    const form = new FormData(event.currentTarget);
    const story = String(form.get('story') || '').trim();
    const author = String(form.get('author') || '').trim() || 'Anonymous Victim';
    const category = String(form.get('category') || 'ghosted');

    if (!story) return;

    setSubmissionStatus('checking');
    setSubmissionMessage('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, author, category }),
      });
      const result = await response.json();

      if (!response.ok || !result.approved) {
        setSubmissionStatus('blocked');
        setSubmissionMessage(result.reason || 'This post cannot be published.');
        return;
      }

      setPostedEntries((current) => [
        {
          ...result.post,
          id: result.post.id || crypto.randomUUID(),
        },
        ...current,
      ]);
      event.currentTarget.reset();
      setSubmissionStatus('idle');
      setIsModalOpen(false);
    } catch {
      setSubmissionStatus('error');
      setSubmissionMessage('Could not reach the safety check. Please try again.');
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
            <article className="entry-card" key={entry.id}>
              <div>
                <div className="entry-meta">
                  <CategoryBadge categoryKey={entry.category} />
                  <span>{entry.time}</span>
                </div>
                <p>{entry.story}</p>
              </div>
              <footer>
                <span>{entry.author}</span>
                <button type="button" aria-label={`Support ${entry.author}`}>
                  <HeartCrack aria-hidden="true" />
                  {entry.count}
                </button>
              </footer>
            </article>
          ))}
        </section>
      </main>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading">
              <h3 id="modal-title">Share Your Grievance</h3>
              <button type="button" className="icon-button" onClick={resetModal} aria-label="Close">
                <X aria-hidden="true" />
              </button>
            </div>
            <form className="submission-form" onSubmit={handleSubmit}>
              <label>
                Category
                <select name="category" defaultValue="ghosted">
                  <option value="ghosted">Ghosted</option>
                  <option value="redFlag">Massive Red Flags</option>
                  <option value="flaked">Promised & Flaked</option>
                </select>
              </label>
              <label>
                Your Alias
                <input name="author" type="text" placeholder="e.g. DisappointedEngineer" />
              </label>
              <label>
                The Story
                <textarea name="story" rows="4" placeholder="What went down..." required />
              </label>
              {submissionMessage ? (
                <p className={`submission-message ${submissionStatus}`}>{submissionMessage}</p>
              ) : null}
              <div className="form-actions">
                <button type="button" className="ghost-button" onClick={resetModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={submissionStatus === 'checking'}>
                  {submissionStatus === 'checking' ? 'Checking...' : 'Post Anonymously'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CategoryBadge({ categoryKey }) {
  const category = categories[categoryKey];
  const Icon = category.icon;

  return (
    <span className={`badge ${categoryKey}`}>
      <Icon aria-hidden="true" />
      {category.label.replace('Massive ', '').replace('Promised & ', '')}
    </span>
  );
}

createRoot(document.getElementById('root')).render(<App />);
