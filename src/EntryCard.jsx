import { HeartCrack, ThumbsDown } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { getEntryTimeLabel } from './time';

export function EntryCard({ canVote, entry, isDisliked, isLiked, onDislike, onLike }) {
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
          {canVote ? (
            <>
              <button
                type="button"
                aria-label={isLiked ? `Remove support for ${entry.author}` : `Support ${entry.author}`}
                aria-pressed={isLiked}
                onClick={() => onLike(entry)}
              >
                <HeartCrack aria-hidden="true" />
                {entry.count}
              </button>
              <button
                className="dislike-button"
                type="button"
                aria-label={isDisliked ? `Remove dislike for ${entry.author}` : `Dislike ${entry.author}`}
                aria-pressed={isDisliked}
                onClick={() => onDislike(entry)}
              >
                <ThumbsDown aria-hidden="true" />
                {entry.dislikeCount || 0}
              </button>
            </>
          ) : (
            <>
              <span className="entry-action-count" aria-label={`${entry.count} supports`}>
                <HeartCrack aria-hidden="true" />
                {entry.count}
              </span>
              <span className="entry-action-count dislike-count" aria-label={`${entry.dislikeCount || 0} dislikes`}>
                <ThumbsDown aria-hidden="true" />
                {entry.dislikeCount || 0}
              </span>
            </>
          )}
        </div>
      </footer>
    </article>
  );
}
