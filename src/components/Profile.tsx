import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Camera, LogOut, Save } from 'lucide-react';

export const Profile: React.FC<{ user: any; profileData: any }> = ({ user, profileData }) => {
  const [name, setName] = useState(profileData?.displayName || '');
  const [photo, setPhoto] = useState(profileData?.photoURL || '');
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: name,
        photoURL: photo,
        updatedAt: new Date().toISOString()
      });
      alert('Profile updated successfully!');
    } catch (e: any) {
      console.error(e);
      alert('Error updating profile: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-pink-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
            {photo ? (
              <img src={photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={40} className="text-pink-300" />
            )}
          </div>
          <button 
            onClick={() => {
              const url = prompt('Enter Profile Picture URL:');
              if (url) setPhoto(url);
            }} 
            className="absolute bottom-0 right-0 p-2 bg-brand-pink text-white rounded-full shadow-lg"
          >
            <Camera size={14} />
          </button>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{name || 'Squad Member'}</p>
          <p className="text-xs font-black text-gray-400 tracking-widest">{user.phoneNumber}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-pink-50 space-y-4 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
          <input 
            type="text"
            value={name}
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-sm font-bold"
          />
        </div>
        
        <button 
          onClick={onSave}
          disabled={loading}
          className="w-full py-4 bg-brand-pink text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-pink/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Public Profile'}
        </button>
      </div>

      <div className="pt-4">
        <button 
          onClick={() => auth.signOut()}
          className="w-full py-4 border border-red-100 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 active:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};
