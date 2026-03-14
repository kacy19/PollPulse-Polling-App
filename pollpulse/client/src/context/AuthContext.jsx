import { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem('pp_user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('pp_token'));

  const login = (data) => {
    localStorage.setItem('pp_token', data.token);
    localStorage.setItem('pp_user', JSON.stringify(data.user));
    setToken(data.token); setUser(data.user);
  };
  const logout = () => {
    localStorage.clear(); setToken(null); setUser(null);
  };

  return <Ctx.Provider value={{ user, token, isAuth: !!token, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
