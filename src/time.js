const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: 'auto',
});

const timeUnits = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
];

export function getEntryTimeLabel(entry) {
  if (entry.type === 'system') {
    return entry.displayTime || entry.time || '';
  }

  if (!entry.createdAt) {
    return entry.displayTime || entry.time || 'Just now';
  }

  const createdAt = new Date(entry.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    return 'Just now';
  }

  const elapsedSeconds = Math.round((createdAt.getTime() - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(elapsedSeconds);

  for (const { unit, seconds } of timeUnits) {
    if (absoluteSeconds >= seconds) {
      return relativeTimeFormatter.format(Math.round(elapsedSeconds / seconds), unit);
    }
  }

  return 'Just now';
}
