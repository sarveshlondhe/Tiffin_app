import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      if (data.user.role !== 'admin') {
        setError('Access denied. This portal is for admins only.');
        setLoading(false); return;
      }
      login(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-stone-900">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-amber-500 to-orange-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(4)].map((_,i)=>(
            <div key={i} className="absolute border border-white/10 rounded-full" style={{width:`${180+i*120}px`,height:`${180+i*120}px`,top:'50%',left:'40%',transform:'translate(-50%,-50%)'}}/>
          ))}
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🔑</div>
          <span className="font-display font-bold text-white text-2xl">Admin Portal</span>
        </div>
        <div className="relative z-10">
          <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">ADMIN ONLY</div>
          <h2 className="font-display font-extrabold text-white text-5xl leading-tight mb-4">Manage tiffins,<br/>users &<br/>deliveries.</h2>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[['📊','Dashboard'],['🍱','Tiffin Mgmt'],['👥','User Billing'],['✅','Delivery']].map(([icon,label])=>(
            <div key={label} className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
              <span>{icon}</span><span className="text-white text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <div className="inline-block bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-amber-500/30">ADMIN LOGIN</div>
            <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome, Admin 👋</h1>
            <p className="text-stone-400">Sign in to manage your tiffin service</p>
          </div>
          {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">⚠️ {error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1.5">Admin Email</label>
              <input type="email" className="w-full border border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-800 text-white placeholder-stone-500"
                placeholder="admin@tiffin.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1.5">Password</label>
              <input type="password" className="w-full border border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-800 text-white placeholder-stone-500"
                placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
            </div>
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all" disabled={loading}>
              {loading ? 'Signing in...' : '🔑 Sign in as Admin →'}
            </button>
          </form>
          <div className="mt-6 p-4 bg-stone-800 rounded-xl border border-stone-700 text-sm">
            <p className="text-stone-400 font-bold text-xs uppercase tracking-wider mb-2">Default Credentials</p>
            <p className="text-stone-300">Email: <span className="text-amber-400">admin@tiffin.com</span></p>
            <p className="text-stone-300">Password: <span className="text-amber-400">admin123</span></p>
            <p className="text-stone-500 text-xs mt-2">Run <code className="text-amber-400 bg-stone-900 px-1 rounded">npm run seed</code> in backend first</p>
          </div>
          <div className="mt-4 text-center space-y-2">
            <p className="text-stone-500 text-sm">Need a new admin? <Link to="/admin/register" className="text-amber-400 font-semibold">Register</Link></p>
            <p className="text-stone-600 text-sm">Not an admin? <Link to="/login" className="text-stone-400 hover:text-stone-300">User Login →</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}