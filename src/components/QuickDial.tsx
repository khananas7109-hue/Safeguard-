import React from 'react';
import { Phone, Shield } from 'lucide-react';

const HELPLINES = [
  { name: 'Police', number: '100', color: 'bg-blue-600' },
  { name: 'Women Helpline', number: '1091', color: 'bg-pink-600' },
  { name: 'Ambulance', number: '108', color: 'bg-red-600' },
];

export const QuickDial: React.FC = () => {
  const call = (num: string) => {
    window.location.href = `tel:${num}`;
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {HELPLINES.map((h) => (
        <button
          key={h.name}
          onClick={() => call(h.number)}
          className={`${h.color} text-white p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg active:scale-95 transition-transform`}
        >
          <Phone size={18} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{h.name}</span>
          <span className="text-[10px] font-black">{h.number}</span>
        </button>
      ))}
    </div>
  );
};
