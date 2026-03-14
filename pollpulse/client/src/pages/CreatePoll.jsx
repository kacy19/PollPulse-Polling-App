import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CreatePoll() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = idx => setOptions(options.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!question || options.filter(o => o.trim() !== '').length < 2) {
      setError('Please provide a question and at least 2 options.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question,
          options: options.filter(o => o.trim() !== ''),
          expiresAt: expiresAt || null
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to create poll');
      navigate(`/poll/${data._id}`);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-narrow">
      <div className="fade-up">
        <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>Create a New Poll</h1>
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Question</label>
              <input
                className="input-field"
                placeholder="What's your favorite color?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Options</label>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <input
                    className="input-field"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <button type="button" className="btn btn-danger" onClick={() => removeOption(idx)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-outline" onClick={addOption}>+ Add Option</button>
            </div>

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

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
              {loading ? 'Creating Poll...' : 'Create Poll →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
