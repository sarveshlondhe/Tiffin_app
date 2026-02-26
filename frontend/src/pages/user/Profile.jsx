import { useState } from 'react';
import Layout from '../../components/Layout';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name||'', phone: user?.phone||'' });
  const [profileMsg, setProfileMsg] = useState({ text: '', ok: false });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState({ text: '', ok: false });
  const [pwdLoading, setPwdLoading] = useState(false);

  const saveProfile = async e => {
    e.preventDefault(); setProfileMsg({ text: '', ok: false }); setProfileLoading(true);
    try {
      const { data } = await authAPI.updateProfile(profile);
      updateUser(data.user);
      setProfileMsg({ text: 'Profile updated!', ok: true });
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Update failed', ok: false });
    } finally { setProfileLoading(false); }
  };

  const changePassword = async e => {
    e.preventDefault(); setPwdMsg({ text: '', ok: false });
    if (pwd.newPassword !== pwd.confirm) { setPwdMsg({ text: 'Passwords do not match', ok: false }); return; }
    setPwdLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setPwdMsg({ text: 'Password changed successfully!', ok: true });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwdMsg({ text: err.response?.data?.message || 'Failed', ok: false });
    } finally { setPwdLoading(false); }
  };

  return (
    <Layout title="My Profile" subtitle="Manage your account">
      <div className="max-w-xl space-y-6">
        <div className="card">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-saffron-100 flex items-center justify-center text-saffron-700 font-display font-bold text-2xl">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-stone-900">{user?.name}</h3>
              <p className="text-stone-400">{user?.email}</p>
              <span className="inline-block mt-1 bg-leaf-100 text-leaf-700 text-xs font-bold px-2 py-0.5 rounded-full">👤 User</span>
            </div>
          </div>
          {profileMsg.text && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${profileMsg.ok?'bg-leaf-50 border border-leaf-200 text-leaf-700':'bg-red-50 border border-red-200 text-red-600'}`}>
              {profileMsg.ok?'✅':'⚠️'} {profileMsg.text}
            </div>
          )}
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name</label>
              <input type="text" className="input-field" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email <span className="text-stone-400 font-normal">(cannot change)</span></label>
              <input type="email" className="input-field bg-stone-50 cursor-not-allowed" value={user?.email} disabled />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Phone</label>
              <input type="tel" className="input-field" placeholder="9876543210" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} />
            </div>
            <button type="submit" className="btn-primary" disabled={profileLoading}>{profileLoading?'Saving...':'Save Profile'}</button>
          </form>
        </div>

        <div className="card">
          <h3 className="font-display font-bold text-lg mb-5">Change Password</h3>
          {pwdMsg.text && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${pwdMsg.ok?'bg-leaf-50 border border-leaf-200 text-leaf-700':'bg-red-50 border border-red-200 text-red-600'}`}>
              {pwdMsg.ok?'✅':'⚠️'} {pwdMsg.text}
            </div>
          )}
          <form onSubmit={changePassword} className="space-y-4">
            {[{label:'Current Password',key:'currentPassword'},{label:'New Password',key:'newPassword'},{label:'Confirm New',key:'confirm'}].map(({label,key})=>(
              <div key={key}>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label}</label>
                <input type="password" className="input-field" placeholder="••••••••" value={pwd[key]} onChange={e=>setPwd({...pwd,[key]:e.target.value})} required />
              </div>
            ))}
            <button type="submit" className="btn-primary" disabled={pwdLoading}>{pwdLoading?'Changing...':'Change Password'}</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}