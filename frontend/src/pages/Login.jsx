import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      if (data.user.role === 'admin') {
        setError('This is user login. Go to Admin Login for admin access.');
        setLoading(false); return;
      }
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-stone-50">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-saffron-500 to-saffron-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full animate-spin-slow" style={{borderRadius:'40% 60% 70% 30%/40% 50% 60% 50%'}} />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🍱</div>
          <span className="font-display font-bold text-white text-2xl">TiffinBox</span>
        </div>
        <div className="relative z-10">
          <h2 className="font-display font-extrabold text-white text-5xl leading-tight mb-4">Daily fresh<br/>tiffin, managed<br/>beautifully.</h2>
          <p className="text-saffron-100 text-lg">Track your meals, monitor your bill.</p>
        </div>
        <div className="relative z-10 flex gap-3 flex-wrap">
          {['🥘 Home meals','📊 Track bills','📅 Daily updates'].map(t=>(
            <div key={t} className="bg-white/15 rounded-xl px-4 py-2 text-white text-sm font-medium">{t}</div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-stone-900 mb-2">Welcome back 👋</h1>
            <p className="text-stone-500">Sign in to your account</p>
          </div>
          {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">⚠️ {error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
              <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading?'Signing in...':'Sign in →'}</button>
          </form>
          <p className="mt-4 text-center text-stone-500 text-sm">No account? <Link to="/register" className="text-saffron-600 font-semibold">Register</Link></p>
          <div className="mt-6 pt-6 border-t border-stone-200 text-center">
            <p className="text-stone-400 text-sm mb-1">Are you an admin?</p>
            <Link to="/admin/login" className="text-amber-600 font-semibold text-sm hover:text-amber-700">Go to Admin Login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}