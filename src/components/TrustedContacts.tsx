import React, { useState } from 'react';
import { Users, Plus, X, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contact } from '../types';

interface TrustedContactsProps {
  contacts: Contact[];
  onAdd: (name: string, phone: string) => void;
  onRemove: (id: string) => void;
}

export const TrustedContacts: React.FC<TrustedContactsProps> = ({ contacts, onAdd, onRemove }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = () => {
    if (contacts.length >= 5) {
      alert("Maximum 5 trusted contacts allowed for optimal safety response.");
      return;
    }
    if (name && phone) {
      // Normalize phone number to include + prefix for consistent Firestore matching
      const normalizedPhone = phone.trim().startsWith('+') ? phone.trim() : '+' + phone.trim().replace(/\s/g, '');
      onAdd(name, normalizedPhone);
      setName('');
      setPhone('');
      setShowAdd(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-pink-50 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-pink/10 rounded-xl">
            <Users size={18} className="text-brand-pink" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Trusted Contacts</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {contacts.length}/5 Squad Members
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`p-2 rounded-full transition-all ${showAdd ? 'bg-gray-100 dark:bg-slate-800 rotate-45' : 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20'}`}
        >
          <Plus size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            <div className="space-y-2 pt-2">
              <input 
                type="text" 
                placeholder="Member Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
              />
              <input 
                type="tel" 
                placeholder="Phone (e.g. +91...)" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
              />
              <button 
                onClick={handleAdd}
                className="w-full py-3 bg-brand-pink text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-pink/10"
              >
                Confirm Addition
              </button>
            </div>
            <div className="h-px bg-pink-50 dark:bg-slate-800 my-2" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-2">
        {contacts.map((contact) => (
          <motion.div 
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={contact.id} 
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100/50 dark:border-slate-800 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center font-bold text-brand-pink text-sm">
                {contact.name[0]}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">{contact.name}</p>
                <div className="flex items-center gap-1 opacity-40">
                  <Phone size={8} />
                  <p className="text-[9px] font-black">{contact.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
               <ShieldCheck size={14} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
               <button 
                 onClick={() => onRemove(contact.id)}
                 className="p-2 text-gray-300 hover:text-red-500 transition-colors"
               >
                 <X size={14} />
               </button>
            </div>
          </motion.div>
        ))}
        {contacts.length === 0 && !showAdd && (
          <div className="py-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60 italic">Your squad is empty 🛡️</p>
          </div>
        )}
      </div>
    </div>
  );
};
