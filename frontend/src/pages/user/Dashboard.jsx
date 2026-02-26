import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard() {
  const { user } = useAuth();
  const [todayData, setTodayData] = useState(null);
  const [totals, setTotals] = useState({ monthlyTotal: 0, overallTotal: 0, monthlyDays: 0 });
  const [loading, setLoading] = useState(true);
  const [skipping, setSkipping] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', items: '', price: '' });
  const [addMsg, setAddMsg] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const currentMonth = new Date().toISOString().slice(0,7);
  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = async () => {
    try {
      const [t, tot] = await Promise.all([userAPI.getTodayTiffin(), userAPI.getTotal(currentMonth)]);
      setTodayData(t.data);
      setTotals(tot.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const skipToday = async () => {
    if (!confirm("Skip today's tiffin?")) return;
    setSkipping(true);
    try {
      await userAPI.skipTiffin(todayStr);
      setTodayData(prev => ({ ...prev, log: { ...prev.log, status: 'skipped' } }));
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSkipping(false); }
  };

  const submitAdd = async e => {
    e.preventDefault(); setAddMsg(''); setAddLoading(true);
    try {
      await userAPI.addPersonalTiffin({
        date: todayStr,
        title: addForm.title,
        items: addForm.items,
        price: Number(addForm.price),
      });
      setAddMsg('✅ Added successfully!');
      setAddForm({ title: '', items: '', price: '' });
      await loadData();
      setTimeout(() => { setShowAdd(false); setAddMsg(''); }, 1000);
    } catch (err) { setAddMsg('⚠️ ' + (err.response?.data?.message || 'Failed')); }
    finally { setAddLoading(false); }
  };

  const deletePersonal = async (id) => {
    if (!confirm('Delete this tiffin entry?')) return;
    await userAPI.deletePersonal(id);
    await loadData();
  };

  if (loading) return (
    <Layout title="Dashboard">
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    </Layout>
  );

  const tiffin = todayData?.tiffin;
  const log = todayData?.log;
  const personal = todayData?.personal || [];

  const statusBadge = () => {
    if (!log) return null;
    if (log.status === 'delivered') return <span className="badge-delivered">✓ Delivered</span>;
    if (log.status === 'skipped') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-500">⏭ Skipped</span>;
    return <span className="badge-pending">⏳ Pending</span>;
  };

  return (
    <Layout title="Dashboard">
      <div className="mb-4">
        <p className="text-stone-400 text-xs">
          {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
        </p>
        <p className="text-stone-700 text-sm mt-0.5">
          Welcome back, <span className="font-semibold text-stone-900">{user?.name}</span> 👋
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon:'🍱', label:"Today",      value: tiffin ? `₹${tiffin.price}` : '—',  color:'bg-saffron-50 text-saffron-700 border-saffron-100' },
          { icon:'📅', label:'This Month', value:`₹${totals.monthlyTotal}`,             color:'bg-leaf-50 text-leaf-700 border-leaf-100' },
          { icon:'💰', label:'Total',      value:`₹${totals.overallTotal}`,             color:'bg-stone-50 text-stone-700 border-stone-100' },
        ].map(({icon,label,value,color}) => (
          <div key={label} className={`card border-2 ${color} p-3 text-center`}>
            <span className="text-2xl block mb-1">{icon}</span>
            <div className="font-display font-bold text-lg leading-tight">{value}</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Admin tiffin card */}
      {tiffin ? (
        <div className="card border-2 border-saffron-100 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 bg-saffron-500 rounded-2xl flex items-center justify-center text-xl shadow-sm flex-shrink-0">🍽️</div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-lg text-stone-900 leading-tight">{tiffin.title}</h3>
                <p className="text-stone-400 text-xs">Today's tiffin from admin</p>
              </div>
            </div>
            <div className="font-display font-bold text-2xl text-saffron-600 flex-shrink-0 ml-2">₹{tiffin.price}</div>
          </div>
          {tiffin.items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tiffin.items.map((item,i) => (
                <span key={i} className="bg-stone-100 text-stone-700 rounded-lg px-2.5 py-1 text-sm font-medium">{item}</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            {statusBadge()}
            {log?.status === 'pending' && (
              <button onClick={skipToday} disabled={skipping}
                className="text-sm px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold transition-all">
                {skipping ? '...' : '⏭ Skip Today'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card border border-stone-100 mb-4 text-center py-8">
          <div className="text-4xl mb-2">🍱</div>
          <p className="font-display font-bold text-stone-600 mb-1">No admin tiffin today</p>
          <p className="text-stone-400 text-sm">Admin hasn't posted yet. Add your own below!</p>
        </div>
      )}

      {/* Personal tiffins today */}
      {personal.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Your Added Tiffins Today</p>
          <div className="space-y-2">
            {personal.map((p, i) => (
              <div key={i} className="card border border-purple-100 bg-purple-50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0">🥘</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-purple-900 text-sm">{p.title}</p>
                    {p.items?.length > 0 && (
                      <p className="text-purple-400 text-xs truncate">{p.items.join(', ')}</p>
                    )}
                    <p className="text-purple-300 text-xs">{p.addedBy === 'admin' ? '👑 Added by Admin' : '👤 Added by you'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="font-display font-bold text-purple-600">₹{p.price}</span>
                  {p.addedBy === 'user' && (
                    <button onClick={() => deletePersonal(p._id)}
                      className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs hover:bg-red-200 transition-all">
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add personal tiffin button */}
      <button onClick={() => setShowAdd(true)}
        className="w-full card border-2 border-dashed border-stone-200 hover:border-saffron-400 hover:bg-saffron-50 transition-all p-4 text-center group mb-4">
        <div className="flex items-center justify-center gap-2 text-stone-400 group-hover:text-saffron-600 transition-colors">
          <span className="text-2xl">➕</span>
          <div className="text-left">
            <p className="font-semibold text-sm">Add Your Own Tiffin</p>
            <p className="text-xs">Track extra meals or homemade food</p>
          </div>
        </div>
      </button>

      {/* Bottom stats */}
      <div className="p-4 bg-white rounded-2xl border border-stone-100">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="font-display font-bold text-xl text-stone-900">{totals.monthlyDays || 0}</p>
            <p className="text-xs text-stone-400 font-medium">This month</p>
          </div>
          <div className="w-px h-10 bg-stone-100"/>
          <div className="text-center flex-1">
            <p className="font-display font-bold text-xl text-saffron-600">₹{totals.monthlyTotal}</p>
            <p className="text-xs text-stone-400 font-medium">Month bill</p>
          </div>
          <div className="w-px h-10 bg-stone-100"/>
          <Link to="/calendar" className="text-center flex-1">
            <p className="font-display font-bold text-xl text-stone-900 hover:text-saffron-600 transition-colors">📅</p>
            <p className="text-xs text-stone-400 font-medium">Calendar</p>
          </Link>
        </div>
      </div>

      {/* Add tiffin modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-stone-900">Add Personal Tiffin</h3>
                <p className="text-saffron-600 text-sm font-semibold">{todayStr}</p>
              </div>
              <button onClick={() => setShowAdd(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200">
                ×
              </button>
            </div>
            {addMsg && <div className="mb-3 p-3 bg-stone-50 rounded-xl text-sm text-stone-700">{addMsg}</div>}
            <form onSubmit={submitAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Title *</label>
                <input type="text" className="input-field" placeholder="e.g. Ghar ka khana"
                  value={addForm.title} onChange={e=>setAddForm({...addForm,title:e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Items <span className="text-stone-400 font-normal">(optional, comma separated)</span>
                </label>
                <input type="text" className="input-field" placeholder="Roti, Dal, Rice, Sabji"
                  value={addForm.items} onChange={e=>setAddForm({...addForm,items:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Price (₹) *</label>
                <input type="number" className="input-field" placeholder="0" min="0"
                  value={addForm.price} onChange={e=>setAddForm({...addForm,price:e.target.value})} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={addLoading}>
                  {addLoading ? 'Adding...' : '+ Add Tiffin'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}