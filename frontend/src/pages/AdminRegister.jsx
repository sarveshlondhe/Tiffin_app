import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminSecret: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await authAPI.adminRegister(form);
      login(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 p-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl">🔑</div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Create Admin Account</h1>
            <p className="text-stone-400 text-sm">Requires the admin secret key</p>
          </div>
        </div>
        {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">⚠️ {error}</div>}
        <div className="bg-stone-800 rounded-2xl border border-stone-700 p-6 space-y-4">
          {[
            {label:'Full Name', key:'name', type:'text', ph:'Admin Name'},
            {label:'Email', key:'email', type:'email', ph:'admin@yourdomain.com'},
            {label:'Password', key:'password', type:'password', ph:'Min 6 characters'},
          ].map(({label,key,type,ph})=>(
            <div key={key}>
              <label className="block text-sm font-semibold text-stone-300 mb-1.5">{label}</label>
              <input type={type} className="w-full border border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-900 text-white placeholder-stone-500"
                placeholder={ph} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-stone-300 mb-1.5">Admin Secret Key</label>
            <input type="password" className="w-full border border-amber-500/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-900 text-white placeholder-stone-500"
              placeholder="TIFFIN_ADMIN_2024" value={form.adminSecret} onChange={e=>setForm({...form,adminSecret:e.target.value})} required />
            <p className="text-stone-500 text-xs mt-1">Default: <code className="text-amber-400">TIFFIN_ADMIN_2024</code></p>
          </div>
          <button onClick={submit} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all" disabled={loading}>
            {loading ? 'Creating...' : '🔑 Create Admin Account →'}
          </button>
        </div>
        <p className="mt-4 text-center text-stone-500 text-sm">Already have account? <Link to="/admin/login" className="text-amber-400 font-semibold">Admin Login</Link></p>
      </div>
    </div>
  );
}