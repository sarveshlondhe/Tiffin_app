import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function UserBill() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [totals, setTotals] = useState({ monthlyTotal: 0, overallTotal: 0, monthlyDays: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([userAPI.getTotal(month), userAPI.getHistory(month)])
      .then(([t, h]) => { setTotals(t.data); setLogs(h.data.logs); })
      .finally(() => setLoading(false));
  }, [month]);

  const monthName = new Date(month+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'});

  return (
    <Layout title="My Bill" subtitle="Monthly billing">
      {/* Month selector */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-semibold text-stone-600">Month:</label>
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="input-field !w-auto !py-2 !text-sm" />
      </div>

      {/* Bill card */}
      <div className="card border-2 border-saffron-200 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-saffron-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60"/>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-saffron-500 rounded-xl flex items-center justify-center text-xl">🧾</div>
            <div>
              <h3 className="font-display font-bold text-lg text-stone-900">Bill Statement</h3>
              <p className="text-stone-400 text-sm">{user?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-saffron-50 rounded-2xl p-4 border border-saffron-100">
              <p className="text-saffron-600 text-xs font-semibold mb-1">{monthName}</p>
              <p className="font-display font-extrabold text-3xl text-saffron-700">₹{totals.monthlyTotal}</p>
              <p className="text-saffron-500 text-xs mt-1">{totals.monthlyDays||0} tiffins</p>
            </div>
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
              <p className="text-stone-500 text-xs font-semibold mb-1">Grand Total</p>
              <p className="font-display font-extrabold text-3xl text-stone-700">₹{totals.overallTotal}</p>
              <p className="text-stone-400 text-xs mt-1">All time</p>
            </div>
          </div>

          {/* Daily breakdown */}
          {loading ? (
            <div className="flex justify-center py-4"><div className="w-5 h-5 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin"/></div>
          ) : logs.length > 0 ? (
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Daily Breakdown</p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {logs.map(log => (
                  <div key={log._id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm font-bold text-stone-600 flex-shrink-0">
                        {new Date(log.date+'T00:00:00').getDate()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{log.tiffinId?.title||'—'}</p>
                        <p className="text-xs text-stone-400">
                          {new Date(log.date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {log.status==='delivered' ? <span className="badge-delivered text-xs">✓</span>
                      : log.status==='skipped'  ? <span className="text-stone-400 text-xs">⏭</span>
                      : <span className="badge-pending text-xs">⏳</span>}
                      <span className="font-display font-bold text-stone-900">₹{log.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-stone-400 text-sm">No tiffins for {monthName}</div>
          )}
        </div>
      </div>
    </Layout>
  );
}