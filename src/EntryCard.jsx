import { HeartCrack } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { getEntryTimeLabel } from './time';

export function EntryCard({ entry }) {
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
        <button type="button" aria-label={`Support ${entry.author}`}>
          <HeartCrack aria-hidden="true" />
          {entry.count}
        </button>
      </footer>
    </article>
  );
}
