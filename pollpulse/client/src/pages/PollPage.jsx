import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

let socket;

export default function PollPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPoll();
    socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on(`poll:${id}`, updated => setPoll(updated));

    return () => socket.disconnect();
  }, [id]);

  const fetchPoll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/polls/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setPoll(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVote = async () => {
    if (selected === null) return;
    setVoting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/polls/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ optionIndex: selected })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setPoll(data);
    } catch (err) { setError(err.message); }
    finally { setVoting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this poll?')) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/polls/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      navigate('/');
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (!poll) return <div className="page"><p>Poll not found.</p></div>;

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const expired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const hasVoted = poll.voters.includes(user?._id);

  return (
    <div className="page">
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 10 }}>{poll.question}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          {poll.options.length} options · {totalVotes} vote{totalVotes !== 1 ? 's' : ''} · by @{poll.creator.username}
        </p>
        {expired && <span className="badge badge-expired" style={{ marginTop: 8, display: 'inline-block' }}>Expired</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {poll.options.map((opt, idx) => {
          const percent = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
          const votedOption = hasVoted && poll.options[idx].votes > 0;
          return (
            <div key={idx} className="card" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: !hasVoted && !expired ? 'pointer' : 'default',
              background: selected === idx ? 'rgba(124,58,255,0.12)' : undefined
            }}
              onClick={() => (!hasVoted && !expired) && setSelected(idx)}
            >
              <span>{opt.text}</span>
              {hasVoted || expired ? (
                <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>{percent}%</span>
              ) : null}
            </div>
          );
        })}
      </div>

      {error && <p className="error-msg" style={{ marginTop: 14 }}>⚠ {error}</p>}

      {!hasVoted && !expired && (
        <button onClick={handleVote} className="btn btn-primary" disabled={voting || selected === null} style={{ marginTop: 20, width: '100%', padding: '12px' }}>
          {voting ? 'Voting...' : 'Vote →'}
        </button>
      )}

      {user?._id === poll.creator._id && (
        <button onClick={handleDelete} className="btn btn-danger" style={{ marginTop: 12, width: '100%', padding: '12px' }}>
          Delete Poll
        </button>
      )}
    </div>
  );
}
