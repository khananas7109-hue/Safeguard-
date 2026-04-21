import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Contact } from '../types';

const PRESETS = [
  "I am safe, don't worry.",
  "I'm on my way home.",
  "Please call me when you can.",
  "I'm taking a cab, license plate: ",
];

export const EmergencyChat: React.FC<{ contacts: Contact[] }> = ({ contacts }) => {
  const sendMessage = (msg: string, phone: string) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
        <MessageSquare size={16} /> Quick Safe Messages
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => contacts.length > 0 && sendMessage(p, contacts[0].phone)}
            className="text-[11px] font-medium bg-pink-50 text-pink-600 px-3 py-2 rounded-full border border-pink-100 hover:bg-pink-100 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {contacts.length === 0 && (
        <p className="text-[10px] text-gray-400 italic text-center">Add contacts to enable quick messaging.</p>
      )}
    </div>
  );
};
