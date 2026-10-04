import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import Loader from '../components/Loader.jsx';
import { STAY_TYPES } from '../utils/format.js';

const initial = { city: '', type: '', guests: '', maxPrice: '' };

export default function Home() {
  const [filters, setFilters] = useState(initial);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const search = (params, pageNum = 1, sortOption = sort) => {
    setLoading(true);
    setError('');
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
    api
      .get('/listings', { params: { ...clean, page: pageNum, sort: sortOption } })
      .then(({ data }) => {
        if (data && data.listings) {
          setListings(data.listings);
          setPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        } else {
          setListings(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search(initial, 1, 'newest');
  }, []);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setPage(1);
    search(filters, 1, sort);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    setPage(1);
    search(filters, 1, newSort);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    search(filters, newPage, sort);
  };

  return (
    <section>
      <div className="hero">
        <h1>Find your next nest.</h1>
        <p className="muted">Homestays, havelis, villas and hostels across India.</p>
        <form className="search-bar card" onSubmit={submit}>
          <input placeholder="Where to? (e.g. Jaipur)" value={filters.city} onChange={set('city')} />
          <select value={filters.type} onChange={set('type')}>
            <option value="">Any type</option>
            {STAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" min="1" placeholder="Guests" value={filters.guests} onChange={set('guests')} />
          <input type="number" min="0" placeholder="Max ₹/night" value={filters.maxPrice} onChange={set('maxPrice')} />
          <button className="btn">Search</button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}
      
      {!loading && listings.length > 0 && (
        <div className="row-between" style={{ margin: '20px 0 14px', alignItems: 'center' }}>
          <span className="muted">{total} stay{total !== 1 ? 's' : ''} available</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="muted small">Sort by:</span>
            <select value={sort} onChange={handleSortChange} style={{ padding: '6px 12px' }}>
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : listings.length === 0 ? (
        <p className="muted">No stays match your search.</p>
      ) : (
        <>
          <div className="grid">
            {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '36px' }}>
              <button
                className="btn btn-outline"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <span className="muted">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
