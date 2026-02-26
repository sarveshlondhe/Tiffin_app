import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { adminAPI } from '../../api';

const PRESETS = [
  { title: 'Veg Thali',     items: 'Roti, Sabji, Dal, Rice, Salad',                     price: '80'  },
  { title: 'Special Thali', items: 'Roti, Paneer Sabji, Dal Tadka, Rice, Raita, Salad', price: '120' },
  { title: 'Simple Meal',   items: 'Roti, Dal, Rice',                                    price: '60'  },
  { title: 'Rajma Chawal',  items: 'Rajma, Rice, Roti, Salad, Pickle',                  price: '70'  },
];

export default function AddTiffin() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ date: today, title: '', items: '', price: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!form.date || !form.title || !form.price) { setError('Date, title and price are required'); return; }
    if (isNaN(Number(form.price)) || Number(form.price) < 0) { setError('Enter a valid price'); return; }
    setLoading(true);
    try {
      const res = await adminAPI.createTiffin({ date: form.date, title: form.title.trim(), items: form.items, price: Number(form.price) });
      setSuccess(res.data.message || 'Tiffin created successfully!');
      setTimeout(() => navigate('/admin/tiffin-list'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tiffin');
    } finally { setLoading(false); }
  };

  const itemList = form.items ? form.items.split(',').map(s=>s.trim()).filter(Boolean) : [];

  return (
    <Layout title="Add Tiffin" subtitle="Create today's tiffin — logs auto-sent to all active users">
      <div className="max-w-2xl">
        <div className="mb-6">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">⚡ Quick Presets</p>
          <div className="grid grid-cols-2 gap-3">
            {PRESETS.map(p => (
              <button key={p.title} type="button" onClick={() => setForm(f => ({ ...f, title: p.title, items: p.items, price: p.price }))}
                className="card text-left hover:border-saffron-300 hover:bg-saffron-50 transition-all cursor-pointer p-4 border-2 border-stone-100">
                <p className="font-display font-bold text-stone-800 text-sm">{p.title}</p>
                <p className="text-stone-400 text-xs mt-1">₹{p.price} · {p.items.split(',').length} items</p>
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-display font-bold text-lg mb-6">Tiffin Details</h3>
          {error   && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">⚠️ {error}</div>}
          {success && <div className="mb-4 p-4 bg-leaf-50 border border-leaf-200 rounded-xl text-leaf-700 text-sm">✅ {success}</div>}
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Date *</label>
                <input type="date" className="input-field" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Price (₹) *</label>
                <input type="number" className="input-field" placeholder="80" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Tiffin Title *</label>
              <input type="text" className="input-field" placeholder="e.g. Veg Thali" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Items <span className="text-stone-400 font-normal">(comma separated)</span></label>
              <input type="text" className="input-field" placeholder="Roti, Dal, Rice, Sabji" value={form.items} onChange={e=>setForm({...form,items:e.target.value})} />
              {itemList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {itemList.map((item,i) => <span key={i} className="bg-saffron-50 text-saffron-700 rounded-lg px-3 py-1 text-sm">{item}</span>)}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Publishing...' : '🚀 Publish Tiffin'}</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/admin/tiffin-list')}>Cancel</button>
            </div>
          </form>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm">
          💡 When you publish, logs are automatically created for ALL active users.
        </div>
      </div>
    </Layout>
  );
}