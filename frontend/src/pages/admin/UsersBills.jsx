import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../api';

export default function UsersBills() {
  const [users, setUsers]           = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]); // ✅ NEW
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [logs, setLogs]             = useState([]);
  const [personal, setPersonal]     = useState([]);
  const [logsTotal, setLogsTotal]   = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [month, setMonth]           = useState(new Date().toISOString().slice(0, 7));
  const [showDetail, setShowDetail] = useState(false);

  // Add tiffin form
  const [showAdd, setShowAdd]   = useState(false);
  const [addForm, setAddForm]   = useState({ date: new Date().toISOString().split('T')[0], title: '', items: '', price: '' });
  const [addMsg, setAddMsg]     = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // ✅ refresh both users + pending users
  const refreshUsers = async () => {
    setLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getPendingUsers(), // ✅ NEW
      ]);
      setUsers(allRes.data || []);
      setPendingUsers(pendingRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const loadLogs = async (user, m) => {
    setSelected(user);
    setLogsLoading(true);
    setShowDetail(true);
    setShowAdd(false);
    setAddMsg('');
    try {
      const { data } = await adminAPI.getUserLogs(user._id, m);
      setLogs(data.logs || []);
      setPersonal(data.personal || []);
      setLogsTotal(data.total || 0);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => { if (selected) loadLogs(selected, month); }, [month]);

  const toggleUser = async u => {
    await adminAPI.toggleUser(u._id);
    setUsers(us => us.map(x => x._id === u._id ? { ...x, isActive: !x.isActive } : x));
    if (selected?._id === u._id) setSelected(s => ({ ...s, isActive: !s.isActive }));
  };

  // ✅ approve pending user
  const approveUser = async (u) => {
    await adminAPI.approveUser(u._id);
    await refreshUsers();
  };

  const markDelivered = async id => {
    await adminAPI.markDelivered(id);
    setLogs(ls => ls.map(l => l._id === id ? { ...l, status: 'delivered' } : l));
  };

  const markPending = async id => {
    await adminAPI.markPending(id);
    setLogs(ls => ls.map(l => l._id === id ? { ...l, status: 'pending' } : l));
  };

  const deliverAll = async () => {
    if (!confirm('Mark ALL pending as delivered?')) return;
    await adminAPI.deliverAll(selected._id, month);
    setLogs(ls => ls.map(l => ({ ...l, status: l.status === 'skipped' ? 'skipped' : 'delivered' })));
  };

  const submitAdd = async e => {
    e.preventDefault();
    setAddMsg('');
    setAddLoading(true);
    try {
      const res = await adminAPI.addPersonalTiffin(selected._id, {
        ...addForm,
        price: Number(addForm.price),
        items: addForm.items,
      });
      setAddMsg('✅ ' + res.data.message);
      setAddForm({ date: new Date().toISOString().split('T')[0], title: '', items: '', price: '' });

      const { data } = await adminAPI.getUserLogs(selected._id, month);
      setLogs(data.logs || []);
      setPersonal(data.personal || []);
      setLogsTotal(data.total || 0);

      setTimeout(() => { setShowAdd(false); setAddMsg(''); }, 1500);
    } catch (err) {
      setAddMsg('⚠️ ' + (err.response?.data?.message || 'Failed to add'));
    } finally {
      setAddLoading(false);
    }
  };

  const pendingCount = logs.filter(l => l.status === 'pending').length;

  // ── USER DETAIL PANEL ──────────────────────────────────────
  const UserDetail = () => (
    <div className="card">
      <button onClick={() => setShowDetail(false)} className="md:hidden flex items-center gap-2 text-stone-500 text-sm font-semibold mb-4">
        ← Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${selected.isActive ? 'bg-saffron-100 text-saffron-700' : 'bg-stone-200 text-stone-400'}`}>
            {selected.name[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-stone-900">{selected.name}</h3>
            <p className="text-stone-400 text-xs">{selected.email}</p>
            {selected.phone && <p className="text-stone-400 text-xs">📞 {selected.phone}</p>}

            {/* ✅ show approval status */}
            {!selected.isApproved && (
              <p className="text-xs font-bold mt-1 text-amber-600">⏳ Pending Approval</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="input-field !w-auto !py-1.5 !text-sm" />

          <button onClick={() => toggleUser(selected)}
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-all ${selected.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-leaf-50 text-leaf-700 hover:bg-leaf-100'}`}>
            {selected.isActive ? '🚫 Deactivate' : '✅ Activate'}
          </button>

          {pendingCount > 0 && (
            <button onClick={deliverAll}
              className="text-xs font-bold px-3 py-2 rounded-lg bg-leaf-500 text-white hover:bg-leaf-600 transition-all">
              ✅ Deliver All ({pendingCount})
            </button>
          )}

          <button
            onClick={() => { setShowAdd(!showAdd); setAddMsg(''); }}
            className="text-xs font-bold px-3 py-2 rounded-lg bg-saffron-500 text-white hover:bg-saffron-600 transition-all"
            disabled={!selected.isApproved} // ✅ block adding before approval
            title={!selected.isApproved ? "Approve user first" : ""}
          >
            ➕ Add Tiffin
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-saffron-50 rounded-xl p-3 border border-saffron-100 text-center">
          <p className="text-saffron-500 text-xs font-bold">Month Bill</p>
          <p className="font-display font-bold text-lg text-saffron-700">₹{logsTotal}</p>
        </div>
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center">
          <p className="text-stone-500 text-xs font-bold">Overall</p>
          <p className="font-display font-bold text-lg text-stone-700">₹{selected.totalBill || 0}</p>
        </div>
        <div className={`rounded-xl p-3 border text-center ${selected.isActive ? 'bg-leaf-50 border-leaf-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-xs font-bold ${selected.isActive ? 'text-leaf-600' : 'text-red-500'}`}>Status</p>
          <p className={`font-display font-bold text-sm mt-0.5 ${selected.isActive ? 'text-leaf-700' : 'text-red-600'}`}>
            {selected.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      {/* ── ADD TIFFIN FORM ── */}
      {showAdd && selected.isApproved && (
        <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
          <h4 className="font-display font-bold text-sm text-amber-800 mb-3">
            ➕ Add Custom Tiffin for <span className="text-saffron-700">{selected.name}</span>
          </h4>
          {addMsg && (
            <div className={`mb-3 p-3 rounded-xl text-sm font-medium ${addMsg.startsWith('✅') ? 'bg-leaf-50 text-leaf-700 border border-leaf-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {addMsg}
            </div>
          )}
          <form onSubmit={submitAdd} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Date *</label>
                <input type="date" className="input-field !py-2 !text-sm" value={addForm.date}
                  onChange={e => setAddForm({ ...addForm, date: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Price (₹) *</label>
                <input type="number" className="input-field !py-2 !text-sm" placeholder="80" min="0"
                  value={addForm.price} onChange={e => setAddForm({ ...addForm, price: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Title *</label>
              <input type="text" className="input-field !py-2 !text-sm" placeholder="e.g. Special Thali, Extra Roti"
                value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Items <span className="text-stone-400 font-normal">(comma separated, optional)</span>
              </label>
              <input type="text" className="input-field !py-2 !text-sm" placeholder="Roti, Dal, Rice"
                value={addForm.items} onChange={e => setAddForm({ ...addForm, items: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary flex-1 !py-2 !text-sm" disabled={addLoading}>
                {addLoading ? 'Adding...' : '➕ Add Tiffin'}
              </button>
              <button type="button" className="btn-secondary !py-2 !text-sm" onClick={() => { setShowAdd(false); setAddMsg(''); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs */}
      {logsLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (logs.length === 0 && personal.length === 0) ? (
        <div className="text-center py-10 text-stone-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">No tiffin logs for this period</p>
          <p className="text-xs mt-1">Approve user first if pending</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Admin daily tiffin logs */}
          {logs.map(log => (
            <div key={log._id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-stone-600 flex-shrink-0 border border-stone-100">
                  {new Date(log.date + 'T00:00:00').getDate()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {log.tiffinId?.title || 'Daily Tiffin'}
                  </p>
                  <p className="text-xs text-stone-400">
                    {new Date(log.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}
                    <span className={
                      log.status === 'delivered' ? 'text-leaf-600' :
                      log.status === 'skipped' ? 'text-stone-400' : 'text-amber-500'
                    }>
                      {log.status === 'delivered' ? '✓ Delivered' : log.status === 'skipped' ? '⏭ Skipped' : '⏳ Pending'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="font-display font-bold text-saffron-600 text-sm">₹{log.price}</span>
                {log.status === 'skipped' ? null
                  : log.status === 'delivered'
                    ? <button onClick={() => markPending(log._id)}
                      className="text-xs bg-white border border-stone-200 text-amber-500 font-semibold px-2 py-1 rounded-lg hover:bg-stone-50">
                      ↩
                    </button>
                    : <button onClick={() => markDelivered(log._id)}
                      className="text-xs bg-leaf-500 text-white font-bold px-2 py-1 rounded-lg hover:bg-leaf-600">
                      ✓
                    </button>
                }
              </div>
            </div>
          ))}

          {/* Personal / custom tiffins added by admin */}
          {personal.map(p => (
            <div key={p._id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-purple-600 flex-shrink-0 border border-purple-100">
                  {new Date(p.date + 'T00:00:00').getDate()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-purple-900 truncate">🥘 {p.title}</p>
                  <p className="text-xs text-purple-400">
                    {new Date(p.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}
                    {p.addedBy === 'admin' ? '👑 Added by Admin' : '👤 Added by User'}
                  </p>
                  {p.items?.length > 0 && (
                    <p className="text-xs text-purple-300 truncate">{p.items.join(', ')}</p>
                  )}
                </div>
              </div>
              <span className="font-display font-bold text-purple-600 text-sm flex-shrink-0 ml-2">₹{p.price}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ✅ pending users section for list screens
  const PendingSection = () => (
    pendingUsers.length === 0 ? null : (
      <div className="card mb-3 border-2 border-amber-200 bg-amber-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-sm text-amber-800">⏳ Pending Approvals</h3>
            <p className="text-xs text-amber-700">{pendingUsers.length} user(s) waiting for approval</p>
          </div>
          <button onClick={refreshUsers} className="text-xs font-bold px-3 py-2 rounded-lg bg-stone-900 text-white">
            Refresh
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {pendingUsers.map(u => (
            <div key={u._id} className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-amber-200">
              <div className="min-w-0">
                <p className="font-semibold text-stone-900 text-sm truncate">{u.name}</p>
                <p className="text-xs text-stone-400 truncate">{u.email}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => approveUser(u)}
                  className="text-xs font-bold px-3 py-2 rounded-lg bg-leaf-600 text-white hover:bg-leaf-700"
                >
                  ✅ Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  return (
    <Layout title="Users & Bills" subtitle="Manage users and deliveries">
      {/* ✅ show pending approvals on top */}
      <PendingSection />

      {/* Mobile */}
      <div className="md:hidden">
        {showDetail && selected ? <UserDetail /> : (
          <div className="space-y-2">
            {loading
              ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" /></div>
              : users.length === 0
                ? <div className="card text-center py-12">
                  <p className="text-4xl mb-2">👥</p>
                  <p className="font-display font-bold text-stone-600">No users yet</p>
                </div>
                : users.map(u => (
                  <div key={u._id} onClick={() => loadLogs(u, month)}
                    className="card p-4 cursor-pointer active:scale-95 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${u.isActive ? 'bg-saffron-100 text-saffron-700' : 'bg-stone-200 text-stone-400'}`}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${u.isActive ? 'text-stone-900' : 'text-stone-400'}`}>{u.name}</p>
                        <p className="text-stone-400 text-xs truncate">{u.email}</p>
                        {!u.isApproved && <p className="text-xs font-bold text-amber-600">⏳ Pending</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display font-bold text-saffron-600">₹{u.totalBill || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {/* User list */}
        <div className="md:col-span-1">
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h3 className="font-display font-bold text-base">All Users</h3>
              <p className="text-stone-400 text-xs">{users.length} users</p>
            </div>
            {loading
              ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" /></div>
              : <div className="divide-y divide-stone-50 max-h-[600px] overflow-y-auto">
                {users.map(u => (
                  <div key={u._id} onClick={() => loadLogs(u, month)}
                    className={`px-5 py-4 cursor-pointer hover:bg-stone-50 transition-all ${selected?._id === u._id ? 'bg-saffron-50 border-l-4 border-saffron-500' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${u.isActive ? 'bg-saffron-100 text-saffron-700' : 'bg-stone-200 text-stone-400'}`}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${u.isActive ? 'text-stone-900' : 'text-stone-400'}`}>{u.name}</p>
                        <p className="text-stone-400 text-xs truncate">{u.email}</p>
                        {!u.isApproved && <p className="text-xs font-bold text-amber-600 mt-0.5">⏳ Pending Approval</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display font-bold text-saffron-600 text-sm">₹{u.totalBill || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="p-6 text-center text-stone-400 text-sm">No users yet</p>}
              </div>}
          </div>
        </div>

        {/* Detail panel */}
        <div className="md:col-span-2">
          {!selected
            ? <div className="card text-center py-20">
              <p className="text-5xl mb-3">👈</p>
              <h3 className="font-display font-bold text-lg text-stone-600">Select a user</h3>
              <p className="text-stone-400 text-sm mt-1">Click any user to view their tiffin logs and add custom tiffins</p>
            </div>
            : <UserDetail />}
        </div>
      </div>
    </Layout>
  );
}