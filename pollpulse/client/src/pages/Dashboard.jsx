import { useEffect, useState } from 'react';
import PollCard from '../components/PollCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [polls, setPolls] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuth } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => fetchPolls(), 300); // debounce search
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/polls${search ? `?search=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setPolls(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* Hero */}
      <div className="fade-up" style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-h)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          lineHeight: 1.15
        }}>
          Vote on anything.<br />
          <span style={{
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Watch results live. ⚡
          </span>
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 12, fontSize: '1.05rem' }}>
          {polls.length} active poll{polls.length !== 1 ? 's' : ''} · real-time results · shareable links
        </p>
        {isAuth && (
          <Link to="/create" className="btn btn-primary" style={{ marginTop: 20, fontSize: '0.95rem', padding: '12px 26px' }}>
            + Create a Poll
          </Link>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 28 }}>
        <input
          className="input-field"
          placeholder="🔍  Search polls..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Poll list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ height: 130, background: 'var(--elevated)' }} />
            ))
          : polls.length > 0
            ? polls.map(poll => <PollCard key={poll._id} poll={poll} />)
            : <p style={{ color: 'var(--muted)', gridColumn: '1/-1', textAlign: 'center', marginTop: 40 }}>No polls found</p>
        }
      </div>
    </div>
  );
}
