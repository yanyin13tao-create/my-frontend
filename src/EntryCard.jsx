import { HeartCrack } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { getEntryTimeLabel } from './time';

export function EntryCard({ entry, isLiked, onLike }) {
  const timeLabel = getEntryTimeLabel(entry);

  return (
    <article className="entry-card">
      <div>
        <div className="entry-meta">
          <CategoryBadge categoryKey={entry.category} />
          <span>{timeLabel}</span>
        </div>
        <p>{entry.story}</p>
      </div>
      <footer>
        <span>{entry.author}</span>
        <button
          type="button"
          aria-label={isLiked ? `Already supported ${entry.author}` : `Support ${entry.author}`}
          aria-pressed={isLiked}
          disabled={isLiked}
          onClick={() => onLike(entry)}
        >
          <HeartCrack aria-hidden="true" />
          {entry.count}
        </button>
      </footer>
    </article>
  );
}
