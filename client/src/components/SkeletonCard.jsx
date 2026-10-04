export default function SkeletonCard() {
  return (
    <div className="card listing-card skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="card-body">
        <div className="row-between">
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
          <div className="skeleton skeleton-text" style={{ width: '25%' }} />
        </div>
        <div className="skeleton skeleton-text" style={{ width: '85%', height: '18px', marginTop: '6px' }} />
        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
        <div className="skeleton skeleton-text" style={{ width: '45%', marginTop: '6px' }} />
      </div>
    </div>
  );
}
