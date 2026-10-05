import { X } from 'lucide-react';

export function SubmissionModal({
  onClose,
  onSubmit,
  submissionMessage,
  submissionStatus,
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <h3 id="modal-title">Share Your Grievance</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>
        <form className="submission-form" onSubmit={onSubmit}>
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
          <label>
            Image
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
          </label>
          {submissionMessage ? (
            <p className={`submission-message ${submissionStatus}`}>{submissionMessage}</p>
          ) : null}
          <div className="form-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={submissionStatus === 'checking'}>
              {submissionStatus === 'checking' ? 'Checking...' : 'Post Anonymously'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
