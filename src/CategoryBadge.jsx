import { categories } from './constants';

export function CategoryBadge({ categoryKey }) {
  const category = categories[categoryKey] || categories.ghosted;
  const Icon = category.icon;

  return (
    <span className={`badge ${categoryKey}`}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {category.label.replace('Massive ', '').replace('Promised & ', '')}
    </span>
  );
}
