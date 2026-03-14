import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar      from './components/Navbar';
import Dashboard   from './pages/Dashboard';
import CreatePoll  from './pages/CreatePoll';
import PollPage    from './pages/PollPage';
import Login       from './pages/Login';
import Register    from './pages/Register';

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/poll/:id" element={<PollPage />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create"  element={<PrivateRoute><CreatePoll /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
