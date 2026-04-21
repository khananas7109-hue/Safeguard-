import React, { useState } from 'react';
import { MapPin, Clock, Users, Shield, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contact, LocationShare } from '../types';

interface LocationSharingProps {
  contacts: Contact[];
  myShare: LocationShare | null;
  sharesWithMe: LocationShare[];
  onStartSharing: (duration: number, phoneNumbers: string[]) => void;
  onStopSharing: () => void;
}

export const LocationSharing: React.FC<LocationSharingProps> = ({
  contacts,
  myShare,
  sharesWithMe,
  onStartSharing,
  onStopSharing
}) => {
  const [duration, setDuration] = useState(30);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  const DURATIONS = [
    { label: '30m', value: 30 },
    { label: '1h', value: 60 },
    { label: '2h', value: 120 },
    { label: '8h', value: 480 },
  ];

  const handleToggleContact = (phone: string) => {
    setSelectedContacts(prev => 
      prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]
    );
  };

  const start = () => {
    if (selectedContacts.length > 0) {
      onStartSharing(duration, selectedContacts);
      setShowConfig(false);
    } else {
      alert("Please select at least one contact to share with.");
    }
  };

  return (
    <div className="space-y-4">
      {/* active sharing status for user */}
      {myShare && (
        <div className="bg-brand-violet text-white p-6 rounded-3xl shadow-lg border border-brand-violet/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Navigation size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Live Location Sharing</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">
                  Expires: {new Date(myShare.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button 
              onClick={onStopSharing}
              className="px-4 py-2 bg-white text-brand-violet rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              Stop
            </button>
          </div>
          <div className="flex -space-x-2">
            {myShare.sharedWith.map((phone, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/30 border-2 border-brand-violet flex items-center justify-center text-[10px] font-bold">
                {phone.slice(-2)}
              </div>
            ))}
          </div>
        </div>
      )}

      {!myShare && !showConfig && (
        <button 
          onClick={() => setShowConfig(true)}
          className="w-full bg-white dark:bg-slate-900 p-6 rounded-3xl border border-pink-100 dark:border-slate-800 flex items-center justify-between group active:scale-95 transition-all shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-violet/10 dark:bg-brand-violet/20 rounded-2xl group-hover:bg-brand-violet/20 transition-colors">
              <MapPin size={24} className="text-brand-violet" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm">Start Live Tracking</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Share journey with family</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300">
             <Clock size={16} />
          </div>
        </button>
      )}

      {/* Sharing Config Modal-like */}
      <AnimatePresence>
        {showConfig && !myShare && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-brand-violet/20 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Shield size={18} className="text-brand-violet" /> Share My Coordinates
              </h3>
              <button onClick={() => setShowConfig(false)} className="text-gray-400 p-2">✕</button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">How long?</label>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${duration === d.value ? 'bg-brand-violet text-white shadow-lg' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Share with who?</label>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {contacts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleToggleContact(c.phone)}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${selectedContacts.includes(c.phone) ? 'border-brand-violet bg-brand-violet/5' : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedContacts.includes(c.phone) ? 'bg-brand-violet text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>
                        {c.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">{c.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold">{c.phone}</p>
                      </div>
                    </div>
                    {selectedContacts.includes(c.phone) && <Shield size={14} className="text-brand-violet" />}
                  </button>
                ))}
                {contacts.length === 0 && (
                  <p className="text-[10px] text-center text-gray-400 py-4 uppercase font-black">No trusted contacts found</p>
                )}
              </div>
            </div>

            <button
              onClick={start}
              className="w-full py-4 bg-brand-violet text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-violet/20 active:scale-95 transition-all"
            >
              Start Live Sharing
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared WITH me - Observer View */}
      {sharesWithMe.length > 0 && (
        <div className="space-y-3 pt-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 leading-tight">Live Squad Feeds</label>
          {sharesWithMe.map(share => (
            <div key={share.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-blue-50 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg">
                    {share.userName[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">{share.userName}</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    Live • {share.battery}% Battery
                  </p>
                </div>
              </div>
              <button 
                onClick={() => window.open(`https://maps.google.com/maps?q=${share.location.latitude},${share.location.longitude}`, '_blank')}
                className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl active:scale-90 transition-transform"
              >
                <Navigation size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
