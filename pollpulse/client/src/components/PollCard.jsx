import { Link } from 'react-router-dom';

export default function PollCard({ poll }) {
  const total    = poll.options.reduce((s, o) => s + o.votes, 0);
  const expired  = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const top      = [...poll.options].sort((a, b) => b.votes - a.votes)[0];

  return (
    <Link to={`/poll/${poll._id}`} style={{ display: 'block' }}>
      <div className="card" style={{
        transition: 'all 0.2s ease', cursor: 'pointer',
        borderColor: 'var(--border)',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(124,58,255,0.4)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,255,0.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Status badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span className={`badge ${expired ? 'badge-expired' : 'badge-live'}`}>
            {!expired && <span className="live-dot" />}
            {expired ? 'Expired' : 'Live'}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            {total} vote{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Question */}
        <h3 style={{
          fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '1.05rem',
          marginBottom: 14, lineHeight: 1.4, color: 'var(--text)'
        }}>
          {poll.question}
        </h3>

        {/* Top option preview */}
        {total > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 5 }}>
              <span style={{ color: 'var(--muted)' }}>Leading: <span style={{ color: 'var(--text)' }}>{top.text}</span></span>
              <span style={{ color: 'var(--accent2)' }}>{Math.round((top.votes / total) * 100)}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--elevated)', borderRadius: 2 }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                width: `${Math.round((top.votes / total) * 100)}%`,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        )}

        {/* Options count + creator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)' }}>
          <span>{poll.options.length} options</span>
          <span>by @{poll.creator?.username}</span>
        </div>
      </div>
    </Link>
  );
}
