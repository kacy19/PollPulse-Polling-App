import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions]   = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { token } = useAuth();
  const navigate  = useNavigate();

  const addOption = () => options.length < 6 && setOptions([...options, '']);
  const removeOption = (i) => options.length > 2 && setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i, val) => setOptions(options.map((o, idx) => idx === i ? val : o));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const filled = options.filter(o => o.trim());
    if (filled.length < 2) { setError('Need at least 2 options'); setLoading(false); return; }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question, options: filled, expiresAt: expiresAt || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      navigate(`/poll/${data._id}`);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
      <div className="fade-up">
        <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '1.9rem', fontWeight: 800, marginBottom: 6 }}>
          Create a Poll
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 30 }}>Ask anything. Get instant answers.</p>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Question */}
            <div>
              <label className="label">Your Question</label>
              <textarea
                className="input-field"
                placeholder="What's your favorite programming language?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required rows={3}
                style={{ resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {/* Options */}
            <div>
              <label className="label">Options ({options.length}/6)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--elevated)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-h)', fontWeight: 700
                    }}>{i + 1}</div>
                    <input
                      className="input-field"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => updateOption(i, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {options.length > 2 && (
                      <button type="button" onClick={() => removeOption(i)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '1.1rem', padding: '4px', lineHeight: 1 }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <button type="button" onClick={addOption} className="btn btn-outline"
                    style={{ alignSelf: 'flex-start', fontSize: '0.85rem', padding: '9px 16px' }}>
                    + Add Option
                  </button>
                )}
              </div>
            </div>

            {/* Expiry */}
            <div>
              <label className="label">Expiry Date (optional)</label>
              <input
                className="input-field"
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
              />
            </div>

            {error && <p className="error-msg">⚠ {error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading || !question.trim()}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}>
              {loading ? <><span className="spinner" /> Creating...</> : '⚡ Launch Poll'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
