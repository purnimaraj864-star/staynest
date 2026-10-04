import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';
import { formatDate } from '../utils/format.js';

export default function Reviews({ listingId, onReviewAdded }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  const load = () => api.get(`/listings/${listingId}/reviews`).then(({ data }) => setReviews(data));
  useEffect(() => {
    load();
  }, [listingId]);

  const hasUserReviewed = user && reviews.some((r) => (r.user?._id || r.user) === user._id);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/listings/${listingId}/reviews`, form);
      setForm({ rating: 5, comment: '' });
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditForm({ rating: r.rating, comment: r.comment });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, comment: '' });
  };

  const submitEdit = async (reviewId) => {
    setError('');
    try {
      await api.put(`/listings/${listingId}/reviews/${reviewId}`, editForm);
      setEditingId(null);
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    setError('');
    try {
      await api.delete(`/listings/${listingId}/reviews/${reviewId}`);
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="reviews">
      <h2>Reviews ({reviews.length})</h2>
      {error && <p className="error">{error}</p>}
      {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      {reviews.map((r) => {
        const isAuthor = user && (r.user?._id || r.user) === user._id;
        const isEditing = editingId === r._id;

        return (
          <div key={r._id} className="review">
            <div className="row-between">
              <strong>{r.user?.name}</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="muted small">{formatDate(r.createdAt)}</span>
                {isAuthor && !isEditing && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                      onClick={() => deleteReview(r._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div style={{ marginTop: '10px' }}>
                <StarRating value={editForm.rating} onChange={(rating) => setEditForm({ ...editForm, rating })} />
                <textarea
                  style={{ width: '100%', marginTop: '6px', minHeight: '60px' }}
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button type="button" className="btn" onClick={() => submitEdit(r._id)}>Save</button>
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="stars-static">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p>{r.comment}</p>
              </>
            )}
          </div>
        );
      })}

      {user && !hasUserReviewed && (
        <form className="card form" onSubmit={submit}>
          <h3>Write a review</h3>
          <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          <textarea
            required
            placeholder="How was your stay?"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          <button className="btn">Submit review</button>
        </form>
      )}
    </section>
  );
}
