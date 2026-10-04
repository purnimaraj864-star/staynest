import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { formatDate, formatINR } from '../utils/format.js';

export default function Trips() {
  const location = useLocation();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/bookings/mine')
      .then(({ data }) => setBookings(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, []);

  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const confirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    try {
      await api.patch(`/bookings/${cancellingBooking._id}/cancel`);
      setCancellingBooking(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  if (!bookings && !error) return <Loader />;

  return (
    <section>
      <h1>My Trips</h1>
      {location.state?.booked && <p className="success">Booking request sent to the host!</p>}
      {error && <p className="error">{error}</p>}
      {bookings?.length === 0 && (
        <p className="muted">No trips yet. <Link to="/">Find a stay</Link></p>
      )}
      <div className="trip-list">
        {bookings?.map((b) => (
          <div key={b._id} className="card trip">
            <img src={b.listing?.images?.[0]} alt={b.listing?.title} />
            <div className="grow">
              <Link to={`/stays/${b.listing?._id}`}><strong>{b.listing?.title}</strong></Link>
              <p className="muted">{b.listing?.city}</p>
              <p>
                {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} night{b.nights > 1 ? 's' : ''} · {b.guests} guest{b.guests > 1 ? 's' : ''}
              </p>
            </div>
            <div className="trip-side">
              <span className={`status status-${b.status}`}>{b.status}</span>
              <strong>{formatINR(b.totalPrice)}</strong>
              {['pending', 'confirmed'].includes(b.status) && (
                <button className="btn btn-danger" onClick={() => setCancellingBooking(b)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {cancellingBooking && (
        <div className="modal-backdrop" onClick={() => setCancellingBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Trip Confirmation</h3>
            <p>
              Are you sure you want to cancel your stay at{' '}
              <strong>{cancellingBooking.listing?.title}</strong>?
            </p>
            <p className="muted small">
              Dates: {formatDate(cancellingBooking.checkIn)} → {formatDate(cancellingBooking.checkOut)}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                disabled={isCancelling}
                onClick={() => setCancellingBooking(null)}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={isCancelling}
                onClick={confirmCancel}
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
