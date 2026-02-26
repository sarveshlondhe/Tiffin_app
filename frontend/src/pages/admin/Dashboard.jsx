import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { adminAPI } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalTiffins: 0, totalRevenue: 0,
    thisMonthRevenue: 0, pendingDeliveries: 0, pendingApprovals: 0,
    todayDone: false, todayTiffin: null,
  });
  const [users, setUsers] = useState([]);
  const [tiffins, setTiffins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [s, u, t] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getUsers(),
          adminAPI.getTiffins(),
        ]);
        setStats(s.data);
        setUsers(u.data);
        setTiffins(t.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard. Check backend is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <Layout title="Dashboard">
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout title="Dashboard">
      <div className="card border-2 border-red-200 bg-red-50 p-6 text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <h3 className="font-display font-bold text-red-800 text-lg mb-2">Backend Error</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          🔄 Retry
        </button>
      </div>
    </Layout>
  );

  const statCards = [
    { icon: '👥', label: 'Active Users',  value: stats.totalUsers,                color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { icon: '🍱', label: 'Total Tiffins', value: stats.totalTiffins,              color: 'bg-saffron-50 text-saffron-700 border-saffron-100' },
    { icon: '💰', label: 'Total Revenue', value: `₹${stats.totalRevenue}`,        color: 'bg-leaf-50 text-leaf-700 border-leaf-100' },
    { icon: '📅', label: 'This Month',    value: `₹${stats.thisMonthRevenue}`,    color: 'bg-purple-50 text-purple-700 border-purple-100' },
    { icon: '⏳', label: 'Pending',       value: stats.pendingDeliveries,         color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { icon: '✅', label: 'Today',
      value: stats.todayDone ? 'Done ✅' : 'Missing ❌',
      color: stats.todayDone ? 'bg-leaf-50 text-leaf-700 border-leaf-100' : 'bg-red-50 text-red-700 border-red-100' },
  ];

  return (
    <Layout title="Dashboard" subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}>

      {/* Pending approvals banner */}
      {stats.pendingApprovals > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">🔔</span>
            <div>
              <p className="font-display font-bold text-blue-800 text-sm">
                {stats.pendingApprovals} user{stats.pendingApprovals > 1 ? 's' : ''} waiting for approval!
              </p>
              <p className="text-blue-600 text-xs">Review new registrations in Users tab.</p>
            </div>
          </div>
          <Link to="/admin/users-bills" className="flex-shrink-0 bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-blue-600 transition-all">
            Review →
          </Link>
        </div>
      )}

      {/* No tiffin banner */}
      {!stats.todayDone && (
        <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-display font-bold text-amber-800 text-sm">Today's tiffin not added yet!</p>
              <p className="text-amber-600 text-xs">Users are waiting.</p>
            </div>
          </div>
          <Link to="/admin/add-tiffin" className="flex-shrink-0 bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-600 transition-all">
            + Add Now
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {statCards.map(({ icon, label, value, color }) => (
          <div key={label} className={`card border-2 ${color} p-4`}>
            <span className="text-2xl block mb-1">{icon}</span>
            <div className="font-display font-bold text-xl mb-0.5">{value}</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-60">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's tiffin */}
        <div className="card">
          <h3 className="font-display font-bold text-base mb-3">Today's Tiffin</h3>
          {stats.todayTiffin ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-saffron-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🍽️</div>
                <div>
                  <p className="font-display font-semibold text-stone-900">{stats.todayTiffin.title}</p>
                  <p className="text-stone-400 text-sm">₹{stats.todayTiffin.price}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {(stats.todayTiffin.items || []).map((item, i) => (
                  <span key={i} className="bg-saffron-50 text-saffron-700 rounded-lg px-2 py-1 text-xs">{item}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-4xl mb-2">🍱</p>
              <p className="text-stone-500 text-sm mb-3">Not added yet</p>
              <Link to="/admin/add-tiffin" className="btn-primary text-sm py-2 px-4">+ Add Now</Link>
            </div>
          )}
        </div>

        {/* Recent tiffins */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base">Recent Tiffins</h3>
            <Link to="/admin/tiffin-list" className="text-saffron-600 text-xs font-semibold">View all →</Link>
          </div>
          <div className="space-y-2">
            {tiffins.slice(0, 5).map(t => (
              <div key={t._id} className="flex items-center justify-between py-1.5 border-b border-stone-50 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center text-xs font-bold text-stone-600 flex-shrink-0">
                    {new Date(t.date + 'T00:00:00').getDate()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{t.title}</p>
                    <p className="text-xs text-stone-400">{t.date}</p>
                  </div>
                </div>
                <span className="font-display font-bold text-saffron-600 text-sm flex-shrink-0 ml-2">₹{t.price}</span>
              </div>
            ))}
            {tiffins.length === 0 && <p className="text-stone-400 text-sm text-center py-4">No tiffins yet</p>}
          </div>
        </div>

        {/* Users overview */}
        <div className="card md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base">Users Overview</h3>
            <Link to="/admin/users-bills" className="text-saffron-600 text-xs font-semibold">Manage →</Link>
          </div>
          {users.filter(u => u.isApproved).length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">No approved users yet. Approve users from the Users tab.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    {['User', 'Email', 'This Month', 'Total', 'Status'].map(h => (
                      <th key={h} className="text-left py-2 text-xs font-bold text-stone-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {users.filter(u => u.isApproved).slice(0, 5).map(u => (
                    <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-2.5 font-semibold text-stone-900 text-sm">{u.name}</td>
                      <td className="py-2.5 text-stone-400 text-sm">{u.email}</td>
                      <td className="py-2.5 font-bold text-purple-600">₹{u.thisMonthTotal || 0}</td>
                      <td className="py-2.5 font-bold text-saffron-600">₹{u.totalBill || 0}</td>
                      <td className="py-2.5">
                        {u.isActive
                          ? <span className="badge-delivered">Active</span>
                          : <span className="badge-pending">Inactive</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}