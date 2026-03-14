import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

export default function PollPage() {
  const { id } = useParams();
  const { token, user, isAuth } = useAuth();
  const navigate = useNavigate();
  const [poll, setPoll]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting]   = useState(false);
  const [voted, setVoted]     = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    fetchPoll();
    socket.on(`poll:${id}`, (updated) => { setPoll(updated); });
    return () => socket.off(`poll:${id}`);
  }, [id]);

  useEffect(() => {
    if (poll && user) {
      setVoted(poll.voters?.map(String).includes(String(user.id)));
    }
  }, [poll, user]);

  const fetchPoll = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/polls/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setPoll(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVote = async () => {
    if (selected === null || !token) return;
    setVoting(true); setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/polls/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ optionIndex: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setPoll(data); setVoted(true);
    } catch (err) { setError(err.message); }
    finally { setVoting(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this poll?')) return;
    await fetch(`${process.env.REACT_APP_API_URL}/api/polls/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    navigate('/');
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (error && !poll) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>😕</div>
      <p>{error}</p>
    </div>
  );

  const total   = poll.options.reduce((s, o) => s + o.votes, 0);
  const expired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const isOwner = user && String(user.id) === String(poll.creator?._id || poll.creator);
  const canVote = isAuth && !voted && !expired;

  const chartData = poll.options.map(o => ({
    name: o.text.length > 14 ? o.text.slice(0, 14) + '…' : o.text,
    fullName: o.text,
    votes: o.votes,
  }));

  const COLORS = ['#7c3aff','#00e5ff','#a56cff','#4aeadc','#ff6b9d','#ffb347'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const p = payload[0].payload;
      const pct = total > 0 ? Math.round((p.votes / total) * 100) : 0;
      return (
        <div style={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ fontFamily: 'var(--font-h)', fontWeight: 700, marginBottom: 4 }}>{p.fullName}</p>
          <p style={{ color: 'var(--accent2)', fontSize: '0.85rem' }}>{p.votes} votes · {pct}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <div className="fade-up">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span className={`badge ${expired ? 'badge-expired' : 'badge-live'}`}>
              {!expired && <span className="live-dot" />}
              {expired ? 'Expired' : 'Live'}
            </span>
            {voted && <span className="badge badge-voted">✓ Voted</span>}
            {isOwner && (
              <button onClick={handleDelete} className="btn btn-danger"
                style={{ marginLeft: 'auto', padding: '5px 12px', fontSize: '0.78rem' }}>
                Delete
              </button>
            )}
          </div>

          <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, lineHeight: 1.3, marginBottom: 10 }}>
            {poll.question}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
            by @{poll.creator?.username} · {total} total vote{total !== 1 ? 's' : ''}
            {poll.expiresAt && (
              <span> · {expired ? 'Expired' : `Expires ${new Date(poll.expiresAt).toLocaleDateString()}`}</span>
            )}
          </p>
        </div>

        {/* Share Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28,
          background: 'var(--elevated)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🔗 {window.location.href}
          </span>
          <button className="btn btn-outline" onClick={copyLink}
            style={{ padding: '6px 14px', fontSize: '0.8rem', flexShrink: 0, color: copied ? 'var(--success)' : undefined, borderColor: copied ? 'var(--success)' : undefined }}>
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Voting */}
        {canVote && (
          <div className="card" style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
              Cast your vote
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {poll.options.map((opt, i) => (
                <button key={i} onClick={() => setSelected(i)}
                  style={{
                    padding: '14px 18px', textAlign: 'left', borderRadius: 10,
                    background: selected === i ? 'rgba(124,58,255,0.15)' : 'var(--elevated)',
                    border: `1px solid ${selected === i ? 'var(--accent)' : 'var(--border)'}`,
                    color: selected === i ? 'var(--text)' : 'var(--muted)',
                    fontWeight: selected === i ? 500 : 400,
                    transition: 'all 0.18s ease', fontSize: '0.95rem',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${selected === i ? 'var(--accent)' : 'var(--border)'}`,
                    background: selected === i ? 'var(--accent)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected === i && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>
            {error && <p className="error-msg" style={{ marginBottom: 12 }}>⚠ {error}</p>}
            <button className="btn btn-primary" onClick={handleVote}
              disabled={selected === null || voting}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}>
              {voting ? <><span className="spinner" /> Voting...</> : '⚡ Submit Vote'}
            </button>
          </div>
        )}

        {!isAuth && (
          <div style={{ textAlign: 'center', padding: '20px', marginBottom: 28, background: 'var(--elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--muted)', marginBottom: 12 }}>Log in to cast your vote</p>
            <a href="/login" className="btn btn-primary" style={{ padding: '9px 22px' }}>Log In to Vote</a>
          </div>
        )}

        {/* Results Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '1rem' }}>
              Live Results
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{total} votes total</span>
          </div>

          {/* Option bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {poll.options.map((opt, i) => {
              const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text)' }}>{opt.text}</span>
                    <span style={{ color: COLORS[i % COLORS.length], fontFamily: 'var(--font-h)', fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--elevated)', borderRadius: 4 }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}cc, ${COLORS[i % COLORS.length]})`,
                      width: `${pct}%`, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                      boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}44`,
                    }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 3 }}>{opt.votes} vote{opt.votes !== 1 ? 's' : ''}</div>
                </div>
              );
            })}
          </div>

          {/* Bar Chart */}
          {total > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chart View</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,255,0.06)' }} />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
