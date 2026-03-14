import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(9,9,15,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '62px',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem'
        }}>⚡</div>
        <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
          Poll<span style={{ color: 'var(--accent)' }}>Pulse</span>
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAuth ? (
          <>
            <Link to="/create" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              + Create Poll
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), #a56cff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '0.8rem'
              }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>@{user?.username}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
