import React from 'react';
import { HeartCrack, MessageCircle, Send, ThumbsDown } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { getEntryTimeLabel } from './time';

function AttachmentGrid({ attachments = [], small = false }) {
  if (!attachments.length) {
    return null;
  }

  return (
    <div className={small ? 'attachment-grid small' : 'attachment-grid'}>
      {attachments.map((attachment) => (
        <a href={attachment.url} key={attachment.id || attachment.url} target="_blank" rel="noreferrer">
          <img src={attachment.thumbnailUrl || attachment.url} alt="" loading="lazy" />
        </a>
      ))}
    </div>
  );
}

export function EntryCard({
  canVote,
  comments,
  commentsStatus,
  entry,
  isCommentsOpen,
  isDisliked,
  isLiked,
  onCommentSubmit,
  onDislike,
  onLike,
  onToggleComments,
}) {
  const timeLabel = getEntryTimeLabel(entry);
  const [commentError, setCommentError] = React.useState('');

  async function handleCommentSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const body = String(form.get('body') || '').trim();
    const author = String(form.get('author') || '').trim() || 'Anonymous Victim';
    const imageFile = form.get('image');
    const hasImage = imageFile instanceof File && imageFile.size > 0;

    if (!body && !hasImage) {
      return;
    }

    setCommentError('');

    try {
      await onCommentSubmit(entry, { body, author, imageFile: hasImage ? imageFile : null });
      formElement.reset();
    } catch (error) {
      setCommentError(error.message || 'Could not publish this comment.');
    }
  }

  return (
    <article className="entry-card">
      <div>
        <div className="entry-meta">
          <CategoryBadge categoryKey={entry.category} />
          <span>{timeLabel}</span>
        </div>
        <p>{entry.story}</p>
        <AttachmentGrid attachments={entry.attachments} />
      </div>
      <footer>
        <span>{entry.author}</span>
        <div className="entry-actions">
          {canVote ? (
            <>
              <button
                type="button"
                aria-expanded={isCommentsOpen}
                aria-label={`Show comments for ${entry.author}`}
                onClick={() => onToggleComments(entry)}
              >
                <MessageCircle aria-hidden="true" />
                {entry.commentCount || 0}
              </button>
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
      {isCommentsOpen ? (
        <section className="comments-panel">
          {commentsStatus === 'loading' ? <p className="comment-note">Loading comments...</p> : null}
          {commentsStatus === 'error' ? <p className="comment-note error">Comments could not be loaded.</p> : null}
          {comments?.length ? (
            <div className="comments-list">
              {comments.map((comment) => (
                <article className="comment" key={comment.id}>
                  {comment.body ? <p>{comment.body}</p> : null}
                  <AttachmentGrid attachments={comment.attachments} small />
                  <span>{comment.author}</span>
                </article>
              ))}
            </div>
          ) : commentsStatus === 'ready' ? (
            <p className="comment-note">No comments yet.</p>
          ) : null}
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <input name="author" type="text" placeholder="Alias" />
            <textarea name="body" rows="2" placeholder="Add a comment..." />
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
            {commentError ? <p className="comment-note error">{commentError}</p> : null}
            <button className="primary-button" type="submit" disabled={commentsStatus === 'posting'}>
              <Send aria-hidden="true" />
              {commentsStatus === 'posting' ? 'Posting...' : 'Comment'}
            </button>
          </form>
        </section>
      ) : null}
    </article>
  );
}
