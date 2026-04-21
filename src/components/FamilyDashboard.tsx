import React from 'react';
import { Battery, Clock, MapPin, Shield } from 'lucide-react';

export const FamilyDashboard: React.FC<{ battery: number; location: { lat?: number; lng?: number } }> = ({ battery, location }) => {
  return (
    <div className="bg-brand-violet/10 rounded-3xl p-6 border border-brand-violet/20 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Shield size={18} className="text-brand-violet" /> Family Dashboard
        </h3>
        <span className="text-[10px] font-bold text-brand-violet bg-white px-2 py-1 rounded-full uppercase">Private Link</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <Battery size={14} />
            <span className="text-[10px] font-bold">DEVICE</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-xl font-black text-gray-800">{battery}%</span>
            <span className={`text-[10px] font-bold ${battery < 20 ? 'text-red-500' : 'text-green-500'}`}>
              {battery < 20 ? 'LOW' : 'OK'}
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <Clock size={14} />
            <span className="text-[10px] font-bold">LAST ACTIVE</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-lg font-black text-gray-800">Just Now</span>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-gray-500 italic text-center">
        Your location and battery are currently shared with your squad.
      </p>
    </div>
  );
};
