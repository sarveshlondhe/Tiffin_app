import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { adminAPI } from '../../api';

export default function TiffinList() {
  const [tiffins, setTiffins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    adminAPI.getTiffins().then(r => setTiffins(r.data)).finally(() => setLoading(false));
  }, []);

  const startEdit = t => { setEditing(t._id); setEditForm({ title: t.title, price: t.price, items: t.items.join(', ') }); };

  const saveEdit = async id => {
    setSaving(true);
    try {
      const { data } = await adminAPI.updateTiffin(id, { ...editForm, price: Number(editForm.price) });
      setTiffins(ts => ts.map(t => t._id === id ? { ...t, ...data.tiffin } : t));
      setEditing(null);
    } catch (err) { alert(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const deleteTiffin = async id => {
    if (!confirm('Delete this tiffin? All user logs will also be deleted.')) return;
    setDeleting(id);
    try {
      await adminAPI.deleteTiffin(id);
      setTiffins(ts => ts.filter(t => t._id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
    finally { setDeleting(null); }
  };

  return (
    <Layout title="Tiffin List" subtitle="Edit or delete any tiffin">
      <div className="flex justify-between items-center mb-4">
        <p className="text-stone-500 text-sm">{tiffins.length} total</p>
        <Link to="/admin/add-tiffin" className="btn-primary text-sm py-2 px-4">+ Add Tiffin</Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : tiffins.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">🍱</p>
          <h3 className="font-display font-bold text-lg text-stone-600">No tiffins yet</h3>
          <Link to="/admin/add-tiffin" className="text-saffron-600 font-semibold text-sm hover:underline">Add first tiffin →</Link>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {tiffins.map(t => (
              <div key={t._id} className={`card p-4 ${t.date === today ? 'border-2 border-saffron-200' : ''}`}>
                {editing === t._id ? (
                  <div className="space-y-3">
                    <input className="input-field" placeholder="Title" value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})}/>
                    <input className="input-field" placeholder="Items (comma separated)" value={editForm.items} onChange={e=>setEditForm({...editForm,items:e.target.value})}/>
                    <input type="number" className="input-field" placeholder="Price" value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})}/>
                    <div className="flex gap-2">
                      <button onClick={()=>saveEdit(t._id)} disabled={saving} className="flex-1 bg-leaf-500 text-white font-bold py-2 rounded-xl text-sm">{saving?'Saving...':'Save'}</button>
                      <button onClick={()=>setEditing(null)} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-display font-bold text-stone-900">{t.title}</p>
                          {t.date === today && <span className="text-xs bg-saffron-100 text-saffron-700 font-bold px-2 py-0.5 rounded-full">TODAY</span>}
                        </div>
                        <p className="text-stone-400 text-xs">{new Date(t.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                      </div>
                      <span className="font-display font-bold text-saffron-600 text-lg flex-shrink-0 ml-2">₹{t.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {t.items.map((item,i)=><span key={i} className="bg-stone-100 text-stone-600 rounded px-2 py-0.5 text-xs">{item}</span>)}
                    </div>
                    <div className="flex gap-3 border-t border-stone-100 pt-3">
                      <button onClick={()=>startEdit(t)} className="text-saffron-600 font-semibold text-sm">✏️ Edit</button>
                      <button onClick={()=>deleteTiffin(t._id)} disabled={deleting===t._id} className="text-red-400 font-semibold text-sm">{deleting===t._id?'...':'🗑 Delete'}</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  {['Date','Title','Items','Price','Actions'].map(h=>(
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {tiffins.map(t => (
                  <tr key={t._id} className={`hover:bg-stone-50 transition-colors ${t.date === today ? 'bg-saffron-50/40' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-stone-700">{new Date(t.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                      {t.date === today && <span className="text-xs text-saffron-600 font-bold">TODAY</span>}
                    </td>
                    <td className="px-6 py-4">
                      {editing === t._id
                        ? <input className="input-field !py-1.5 !text-sm" value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})}/>
                        : <span className="font-display font-semibold text-stone-900">{t.title}</span>}
                    </td>
                    <td className="px-6 py-4">
                      {editing === t._id
                        ? <input className="input-field !py-1.5 !text-sm" value={editForm.items} onChange={e=>setEditForm({...editForm,items:e.target.value})}/>
                        : <div className="flex flex-wrap gap-1">
                            {t.items.slice(0,3).map((item,i)=><span key={i} className="bg-stone-100 text-stone-600 rounded px-2 py-0.5 text-xs">{item}</span>)}
                            {t.items.length>3 && <span className="text-stone-400 text-xs">+{t.items.length-3}</span>}
                          </div>}
                    </td>
                    <td className="px-6 py-4">
                      {editing === t._id
                        ? <input type="number" className="input-field !py-1.5 !text-sm !w-24" value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})}/>
                        : <span className="font-display font-bold text-saffron-600">₹{t.price}</span>}
                    </td>
                    <td className="px-6 py-4">
                      {editing === t._id ? (
                        <div className="flex gap-2">
                          <button onClick={()=>saveEdit(t._id)} disabled={saving} className="bg-leaf-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">{saving?'...':'Save'}</button>
                          <button onClick={()=>setEditing(null)} className="btn-secondary !text-xs !py-1.5 !px-3">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button onClick={()=>startEdit(t)} className="text-saffron-600 text-sm font-semibold">Edit</button>
                          <button onClick={()=>deleteTiffin(t._id)} disabled={deleting===t._id} className="text-red-400 text-sm font-semibold">{deleting===t._id?'...':'Delete'}</button>
                        </div>
                      )}
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