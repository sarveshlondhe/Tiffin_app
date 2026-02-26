import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-stone-50">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-stone-800 to-stone-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍱</span>
          <span className="font-display font-bold text-white text-2xl">TiffinBox</span>
        </div>
        <div>
          <h2 className="font-display font-extrabold text-white text-5xl leading-tight mb-4">
            Join the<br/>tiffin family.
          </h2>
          <p className="text-stone-400 text-lg">Track your meals and manage your bill easily.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['🔔','Daily Alerts'],['📊','Bill Tracking'],['📅','History'],['✅','Easy Access']].map(([icon,label]) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 flex items-center gap-2">
              <span>{icon}</span><span className="text-white text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-stone-900 mb-2">Create account</h1>
            <p className="text-stone-500">Register and start tracking your tiffin instantly</p>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">⚠️ {error}</div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name *</label>
              <input type="text" className="input-field" placeholder="Amit Sharma"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email *</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Phone <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input type="tel" className="input-field" placeholder="9876543210"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password *</label>
              <input type="password" className="input-field" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Register →'}
            </button>
          </form>
          <p className="mt-4 text-center text-stone-500 text-sm">
            Already have account? <Link to="/login" className="text-saffron-600 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}