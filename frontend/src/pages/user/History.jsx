import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { userAPI } from '../../api';

export default function UserHistory() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    setLoading(true);
    userAPI.getHistory(month)
      .then(r => { setLogs(r.data.logs); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <Layout title="My History" subtitle="All your tiffin records">
      {/* Filter */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-stone-500 text-sm">{logs.length} records</p>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="input-field !w-auto !py-2 !text-sm" />
      </div>

      {/* Total card */}
      {logs.length > 0 && (
        <div className="card border-2 border-saffron-100 mb-4 flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-saffron-100 rounded-xl flex items-center justify-center text-xl">📊</div>
            <div>
              <p className="text-xs text-stone-500">Total for {month}</p>
              <p className="font-display font-bold text-2xl text-stone-900">₹{total}</p>
            </div>
          </div>
          <span className="text-stone-400 text-sm">{logs.length} tiffins</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">📭</p>
          <h3 className="font-display font-bold text-lg text-stone-600">No records for {month}</h3>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-2">
            {logs.map(log => (
              <div key={log._id} className="card p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center font-bold text-stone-600 flex-shrink-0">
                    {new Date(log.date+'T00:00:00').getDate()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 text-sm truncate">{log.tiffinId?.title||'—'}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(log.date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(log.tiffinId?.items||[]).slice(0,2).map((item,i)=>(
                        <span key={i} className="bg-stone-100 text-stone-500 rounded px-1.5 py-0.5 text-xs">{item}</span>
                      ))}
                      {(log.tiffinId?.items||[]).length>2 && <span className="text-stone-400 text-xs">+{log.tiffinId.items.length-2}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-saffron-600">₹{log.price}</p>
                  {log.status==='delivered'
                    ? <span className="badge-delivered text-xs">✓</span>
                    : log.status==='skipped'
                    ? <span className="text-xs text-stone-400 font-semibold">⏭</span>
                    : <span className="badge-pending text-xs">⏳</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  {['Date','Tiffin','Items','Price','Status'].map(h=>(
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-stone-700">
                      {new Date(log.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td className="px-6 py-4 font-display font-semibold text-stone-900">{log.tiffinId?.title||'—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(log.tiffinId?.items||[]).slice(0,3).map((item,i)=><span key={i} className="bg-stone-100 text-stone-600 rounded px-2 py-0.5 text-xs">{item}</span>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-display font-bold text-saffron-600">₹{log.price}</td>
                    <td className="px-6 py-4">
                      {log.status==='delivered' ? <span className="badge-delivered">✓ Delivered</span>
                      : log.status==='skipped'  ? <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-400">⏭ Skipped</span>
                      : <span className="badge-pending">⏳ Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}