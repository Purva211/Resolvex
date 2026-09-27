import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({children}){
  const [user,setUser]=useState(JSON.parse(localStorage.getItem('user')||'null'));
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ if(localStorage.getItem('token')) api.get('/auth/me').then(r=>{setUser(r.data);localStorage.setItem('user',JSON.stringify(r.data));}).catch(()=>logout()).finally(()=>setLoading(false)); else setLoading(false); },[]);
  async function login(email,password){const r=await api.post('/auth/login',{email,password});localStorage.setItem('token',r.data.token);localStorage.setItem('user',JSON.stringify(r.data.user));setUser(r.data.user);}
  async function register(name,email,password){const r=await api.post('/auth/register',{name,email,password});localStorage.setItem('token',r.data.token);localStorage.setItem('user',JSON.stringify(r.data.user));setUser(r.data.user);}
  function logout(){localStorage.removeItem('token');localStorage.removeItem('user');setUser(null);}
  return <AuthContext.Provider value={{user,loading,login,register,logout}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
