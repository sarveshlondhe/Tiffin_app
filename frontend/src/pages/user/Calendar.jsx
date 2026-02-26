import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { userAPI } from '../../api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function UserCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`);
  const [calData, setCalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [form, setForm] = useState({ title: '', items: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadCalendar(); }, [month]);

  const loadCalendar = () => {
    setLoading(true);
    userAPI.getCalendar(month)
      .then(r => setCalData(r.data.calendar))
      .finally(() => setLoading(false));
  };

  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const todayStr = today.toISOString().split('T')[0];

  const prevMonth = () => {
    const d = new Date(year, mon - 2, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
  };
  const nextMonth = () => {
    const d = new Date(year, mon, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
  };

  const openAdd = (dateStr) => {
    setSelectedDate(dateStr);
    setForm({ title: '', items: '', price: '' });
    setMsg('');
    setShowAdd(true);
  };

  const submitAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      await userAPI.addPersonalTiffin({ date: selectedDate, title: form.title, items: form.items, price: Number(form.price) });
      setMsg('✅ Added!');
      loadCalendar();
      setTimeout(() => setShowAdd(false), 800);
    } catch (err) { setMsg('⚠️ ' + (err.response?.data?.message || 'Failed')); }
    finally { setSaving(false); }
  };

  const deletePersonal = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await userAPI.deletePersonal(id);
    loadCalendar();
  };

  const getDayStatus = (dateStr) => {
    const d = calData[dateStr];
    if (!d) return 'empty';
    if (d.log?.status === 'delivered') return 'delivered';
    if (d.log?.status === 'skipped') return 'skipped';
    if (d.log?.status === 'pending') return 'pending';
    if (d.personal?.length > 0) return 'personal';
    if (d.adminTiffin) return 'available';
    return 'empty';
  };

  const statusStyle = {
    delivered: 'bg-leaf-100 border-leaf-300 text-leaf-700',
    skipped:   'bg-stone-100 border-stone-300 text-stone-400',
    pending:   'bg-amber-50 border-amber-300 text-amber-700',
    personal:  'bg-purple-50 border-purple-300 text-purple-700',
    available: 'bg-blue-50 border-blue-200 text-blue-600',
    empty:     'bg-white border-stone-100 text-stone-400',
  };

  const monthTotal = Object.values(calData).reduce((sum, d) => {
    const logAmt = d.log?.status !== 'skipped' ? (d.log?.price || 0) : 0;
    const personalAmt = (d.personal || []).reduce((s, p) => s + p.price, 0);
    return sum + logAmt + personalAmt;
  }, 0);

  return (
    <Layout title="My Calendar" subtitle="View and add your daily tiffin">

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-all">←</button>
        <div className="text-center">
          <h3 className="font-display font-bold text-lg text-stone-900">{MONTHS[mon-1]} {year}</h3>
          <p className="text-stone-400 text-xs">Total: <span className="font-bold text-saffron-600">₹{monthTotal}</span></p>
        </div>
        <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-all">→</button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          ['bg-leaf-100 border-leaf-300','Delivered'],
          ['bg-amber-50 border-amber-300','Pending'],
          ['bg-purple-50 border-purple-300','Personal'],
          ['bg-blue-50 border-blue-200','Available'],
          ['bg-stone-100 border-stone-300','Skipped'],
        ].map(([cls, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded border ${cls}`}/>
            <span className="text-xs text-stone-500">{label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-stone-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-bold text-stone-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {[...Array(firstDay)].map((_, i) => (
              <div key={`e${i}`} className="min-h-[70px] md:min-h-[90px] border-b border-r border-stone-50 bg-stone-50/30"/>
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${month}-${String(day).padStart(2,'0')}`;
              const status = getDayStatus(dateStr);
              const d = calData[dateStr];
              const isToday = dateStr === todayStr;

              return (
                <div key={day}
                  className={`min-h-[70px] md:min-h-[90px] border-b border-r border-stone-50 p-1 md:p-2 relative group cursor-pointer transition-all
                    ${isToday ? 'bg-saffron-50' : 'hover:bg-stone-50'}`}
                  onClick={() => openAdd(dateStr)}>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1
                    ${isToday ? 'bg-saffron-500 text-white' : 'text-stone-600'}`}>
                    {day}
                  </div>

                  {d?.adminTiffin && (
                    <div className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate border ${statusStyle[status]}`}>
                      <span className="hidden md:inline">
                        {d.log?.status === 'skipped' ? '⏭' : d.log?.status === 'delivered' ? '✓' : '🍱'} {d.adminTiffin.title}
                      </span>
                      <span className="md:hidden">
                        {d.log?.status === 'skipped' ? '⏭' : d.log?.status === 'delivered' ? '✓' : '🍱'}
                      </span>
                    </div>
                  )}

                  {(d?.personal || []).map((p, pi) => (
                    <div key={pi} onClick={e => e.stopPropagation()}
                      className="text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded px-1 py-0.5 mb-0.5 flex items-center justify-between gap-1">
                      <span className="truncate hidden md:inline">🥘 {p.title}</span>
                      <span className="md:hidden">🥘</span>
                      <button onClick={() => deletePersonal(p._id)}
                        className="text-red-400 hover:text-red-600 flex-shrink-0 font-bold leading-none">×</button>
                    </div>
                  ))}

                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-saffron-500 text-white text-xs items-center justify-center hidden group-hover:flex shadow-sm">+</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-stone-900">Add Tiffin</h3>
                <p className="text-saffron-600 font-semibold text-sm">{selectedDate}</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200">×</button>
            </div>
            {msg && <div className="mb-3 p-3 bg-stone-50 rounded-xl text-sm">{msg}</div>}
            <form onSubmit={submitAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Title *</label>
                <input type="text" className="input-field" placeholder="e.g. Ghar ka khana" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Items <span className="text-stone-400 font-normal">(optional)</span></label>
                <input type="text" className="input-field" placeholder="Roti, Dal, Rice" value={form.items} onChange={e=>setForm({...form,items:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Price (₹) *</label>
                <input type="number" className="input-field" placeholder="0" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Adding...' : '+ Add Tiffin'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}