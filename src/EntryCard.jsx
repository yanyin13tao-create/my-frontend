import { HeartCrack, ThumbsDown } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { getEntryTimeLabel } from './time';

export function EntryCard({ entry, isDisliked, isLiked, onDislike, onLike }) {
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
        <div className="entry-actions">
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
          <button
            className="dislike-button"
            type="button"
            aria-label={isDisliked ? `Already disliked ${entry.author}` : `Dislike ${entry.author}`}
            aria-pressed={isDisliked}
            disabled={isDisliked}
            onClick={() => onDislike(entry)}
          >
            <ThumbsDown aria-hidden="true" />
            {entry.dislikeCount || 0}
          </button>
        </div>
      </footer>
    </article>
  );
}
