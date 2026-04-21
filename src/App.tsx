import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Map as MapIcon, 
  Shield, 
  Smartphone, 
  Users, 
  Settings, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Camera,
  Mic,
  Navigation,
  Navigation2,
  Moon,
  Sun,
  LayoutDashboard,
  Bell,
  MessageSquare,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSafeGuard } from './hooks/useSafeGuard';
import { EmergencyChat } from './components/EmergencyChat';
import { QuickDial } from './components/QuickDial';
import { FamilyDashboard } from './components/FamilyDashboard';
import { Login } from './components/Login';
import { Profile } from './components/Profile';
import { LocationSharing } from './components/LocationSharing';
import { TrustedContacts } from './components/TrustedContacts';

const SIREN_URL = 'https://www.soundjay.com/emergency/police-siren-1.mp3';

export default function App() {
  const { 
    user, profileData, authLoading,
    contacts, addContact, removeContact,
    isSOSActive, setIsSOSActive,
    location,
    battery,
    theme, setTheme,
    evidence,
    journey, setJourney,
    triggerSOS, stopSOS,
    startSharing, stopSharing,
    myShare, sharesWithMe
  } = useSafeGuard();

  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'tools' | 'chat' | 'settings'>('home');
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isJourneyTracking, setIsJourneyTracking] = useState(false);
  const [latestShareAlert, setLatestShareAlert] = useState<any>(null);
  const prevSharesCount = useRef(0);

  // Monitor incoming shares for proactive alerts
  useEffect(() => {
    if (sharesWithMe.length > prevSharesCount.current) {
      const newShare = sharesWithMe[sharesWithMe.length - 1];
      setLatestShareAlert(newShare);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setLatestShareAlert(null), 10000);
      return () => clearTimeout(timer);
    }
    prevSharesCount.current = sharesWithMe.length;
  }, [sharesWithMe]);

  // Siren Control Refs
  const sirenRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const sirenIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSiren = () => {
    if (!sirenRef.current) {
      sirenRef.current = new Audio(SIREN_URL);
      sirenRef.current.loop = true;
    }
    sirenRef.current.play().catch(() => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (!oscillatorRef.current && audioContextRef.current) {
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        sirenIntervalRef.current = setInterval(() => {
          if (ctx.state === 'running') {
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1);
          }
        }, 1000);
        osc.start();
        oscillatorRef.current = osc;
      }
    });
  };

  const stopSirenInternal = () => {
    if (sirenRef.current) {
      sirenRef.current.pause();
      sirenRef.current.currentTime = 0;
    }
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  };

  useEffect(() => {
    if (isSirenPlaying) startSiren();
    else stopSirenInternal();
    return () => stopSirenInternal();
  }, [isSirenPlaying]);

  // Night Mode Effect
  useEffect(() => {
    const hour = new Date().getHours();
    if (theme === 'auto') {
      const isNight = hour >= 18 || hour <= 6;
      document.documentElement.classList.toggle('dark', isNight);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);
  
  // Auth Guard
  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-16 h-16 bg-brand-pink rounded-3xl shadow-xl shadow-brand-pink/30 flex items-center justify-center">
          <ShieldCheck className="text-white" size={32} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const mapUrl = location.latitude 
    ? `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY_HERE&center=${location.latitude},${location.longitude}&zoom=15`
    : `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY_HERE&q=MyLocation`;
  
  // Alternative fallback for without API Key
  const mapLink = location.latitude 
    ? `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`
    : "";

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-slate-950 text-[#1f2937] dark:text-slate-100 font-sans flex flex-col md:max-w-md md:mx-auto md:shadow-2xl overflow-hidden relative transition-colors duration-300">
      {/* Global Share Alert Popup */}
      <AnimatePresence>
        {latestShareAlert && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-8 left-4 right-4 z-50 md:max-w-xs md:left-auto md:right-auto md:left-1/2 md:-translate-x-1/2"
          >
            <div className="bg-brand-violet text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Navigation size={20} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">New Live Update</p>
                  <p className="text-xs font-bold truncate w-32">{latestShareAlert.userName} is sharing</p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveTab('home'); setLatestShareAlert(null); }}
                className="bg-white text-brand-violet px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex-shrink-0"
              >
                View
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Phone Status Bar Mockup */}
      <div className="h-10 px-6 flex justify-between items-center text-xs font-bold text-gray-800 dark:text-slate-400">
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1">
             <span className="text-[10px]">{battery}%</span>
             <div className="w-5 h-2.5 border border-gray-400 dark:border-slate-700 rounded-sm p-[1px] flex items-center">
                <div className="h-full bg-green-500 rounded-sm" style={{ width: `${battery}%` }}></div>
             </div>
          </div>
          <span className="opacity-60 text-[10px]">LTE</span>
        </div>
      </div>

      {/* Main App Content */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-pink rounded-xl shadow-lg shadow-brand-pink/20">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SafeGuard</h1>
        </div>
        <div className="flex items-center gap-2">
           {theme === 'dark' ? (
             <button onClick={() => setTheme('light')} className="p-2 bg-slate-800 text-yellow-400 rounded-full">
               <Sun size={18} />
             </button>
           ) : (
             <button onClick={() => setTheme('dark')} className="p-2 bg-white text-brand-violet rounded-full shadow-sm border border-pink-50">
               <Moon size={18} />
             </button>
           )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-24">
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 py-4">
             {/* Quick Dial Top Banner */}
             <QuickDial />

             {/* SOS Section */}
             <div className="flex flex-col items-center justify-center w-full py-6">
                <div className="relative flex items-center justify-center">
                  <AnimatePresence>
                    {isSOSActive && (
                      <motion.div initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} className="absolute w-48 h-48 bg-red-500 rounded-full" />
                    )}
                  </AnimatePresence>
                  <button
                    onClick={isSOSActive ? stopSOS : triggerSOS}
                    className={`z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 transform active:scale-95 ${
                      isSOSActive ? 'bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]' : 'sos-gradient shadow-lg'
                    }`}
                  >
                    <span className="text-4xl font-extrabold text-white tracking-widest">{isSOSActive ? 'STOP' : 'SOS'}</span>
                    <span className="text-white/80 text-[10px] mt-2 font-bold tracking-[0.2em] uppercase">Press to Alert</span>
                  </button>
                </div>
             </div>

             {/* Live Location Sharing */}
             <LocationSharing 
               contacts={contacts}
               myShare={myShare}
               sharesWithMe={sharesWithMe}
               onStartSharing={startSharing}
               onStopSharing={stopSharing}
             />

             {/* Trusted Squad Section */}
             <TrustedContacts 
               contacts={contacts}
               onAdd={(name, phone) => addContact({ name, phone })}
               onRemove={removeContact}
             />

             {/* Check-in System */}
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-pink-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                         <Bell size={18} />
                      </div>
                      <h3 className="font-bold">Check-in Status</h3>
                   </div>
                   <span className="text-[10px] font-bold text-gray-400">AUTO: 30m</span>
                </div>
                <button className="w-full py-4 bg-green-500 text-white rounded-2xl font-black shadow-lg shadow-green-200 dark:shadow-none active:scale-95 transition-transform">
                   I AM SAFE
                </button>
             </div>

             <FamilyDashboard battery={battery} location={location} />
          </motion.div>
        )}

        {activeTab === 'map' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 space-y-4 h-full flex flex-col">
              <h2 className="text-lg font-bold">Live Rescue Map</h2>
              <div className="flex-1 min-h-[300px] bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-inner border border-gray-100 dark:border-slate-800 relative">
                 {mapLink && (
                   <iframe
                     title="Live Map"
                     width="100%"
                     height="100%"
                     frameBorder="0"
                     src={mapLink}
                     className="grayscale-[20%] contrast-[110%] dark:invert-[90%] dark:hue-rotate-[180deg]"
                   />
                 )}
                 <div className="absolute top-4 right-4 space-y-2">
                    <button className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-lg flex items-center justify-center text-brand-pink">
                       <Navigation size={20} />
                    </button>
                    <button className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-lg flex items-center justify-center text-blue-500">
                       <Navigation2 size={20} />
                    </button>
                 </div>
                 
                 {/* Zone Overlays Mock */}
                 <div className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-pink-50 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-3 h-3 rounded-full bg-green-500"></div>
                       <span className="text-[10px] font-bold">SAFE: Home</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500"></div>
                       <span className="text-[10px] font-bold">RISK: Isolated Area</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl space-y-4 shadow-sm">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                       <Navigation2 size={18} className="text-brand-violet" /> Journey Tracker
                    </h3>
                    <Toggle enabled={isJourneyTracking} onToggle={() => setIsJourneyTracking(!isJourneyTracking)} />
                 </div>
                 <button className="w-full py-3 bg-brand-violet text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    <Navigation size={18} /> Plan Safest Route
                 </button>
              </div>
           </motion.div>
        )}

        {activeTab === 'tools' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 space-y-4">
              <h2 className="text-lg font-bold">Evidence & Tools</h2>
              
              <div className="grid grid-cols-2 gap-3">
                 <ToolCard 
                   icon={<Camera className="text-orange-500" />} 
                   title="Silent Cam" 
                   description="Silently takes 3 photos" 
                 />
                 <ToolCard 
                   icon={<Mic className="text-blue-500" />} 
                   title="Audio Log" 
                   description="Records ambient audio" 
                 />
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm space-y-4 border border-pink-50 dark:border-slate-800">
                 <h3 className="font-bold flex items-center gap-2 text-sm">
                    <Plus size={18} className="text-brand-pink" /> Local Evidence Vault
                 </h3>
                 <div className="grid grid-cols-3 gap-2">
                    {evidence.map(e => (
                       <div key={e.id} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                          {e.type === 'photo' ? (
                             <img src={e.data} alt="Evidence" className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center"><Mic size={16} /></div>
                          )}
                       </div>
                    ))}
                    {evidence.length === 0 && (
                       <div className="col-span-3 py-8 text-center text-[10px] text-gray-400">No evidence collected yet.</div>
                    )}
                 </div>
              </div>

              <ToolCard 
                icon={<Volume2 className="text-red-500" />} 
                title="Emergency Siren" 
                description="Play high-pitched alert" 
                onClick={() => setIsSirenPlaying(!isSirenPlaying)}
                isActive={isSirenPlaying}
              />
           </motion.div>
        )}

        {activeTab === 'chat' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 space-y-4">
              <h2 className="text-lg font-bold">Safe Contact Hub</h2>
              
              <AddContactForm onAdd={(c: any) => addContact({ name: c.name, phone: c.phone })} />

              <EmergencyChat contacts={contacts} />
              
              <div className="space-y-3">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Recent Threads</h3>
                 {contacts.map(c => (
                   <div key={c.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between border border-pink-50 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center font-bold text-brand-pink">
                           {c.name[0]}
                         </div>
                         <div className="flex-1">
                            <p className="font-bold text-sm leading-tight">{c.name}</p>
                            <p className="text-[10px] text-gray-400 truncate w-32 font-bold">{c.phone}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => removeContact(c.id)} className="p-2 text-red-300 hover:text-red-500">
                            <Plus size={16} className="rotate-45" />
                         </button>
                         <MessageSquare size={18} className="text-gray-300" />
                      </div>
                   </div>
                 ))}
                 {contacts.length === 0 && (
                    <div className="text-center py-10 opacity-30">
                       <Users size={48} className="mx-auto mb-2" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">No friends in your squad yet</p>
                    </div>
                 )}
              </div>
           </motion.div>
        )}

        {activeTab === 'settings' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 space-y-6">
              <h2 className="text-lg font-bold">Personal Profile</h2>
              
              <Profile user={user} profileData={profileData} />

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-pink-100 dark:border-slate-800 space-y-4">
                 <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest leading-tight">Safety Theme</h3>
                 <div className="flex gap-2">
                    {['light', 'dark', 'auto'].map(t => (
                       <button 
                        key={t}
                        onClick={() => setTheme(t as any)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${theme === t ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}
                       >
                         {t}
                       </button>
                    ))}
                 </div>
              </div>
           </motion.div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-brand-bg dark:border-slate-800 px-4 flex justify-around items-center z-30 md:max-w-md md:left-auto md:right-auto md:w-full pb-3">
        <NavButton active={activeTab === 'home'} icon={<LayoutDashboard size={22} />} label="Home" onClick={() => setActiveTab('home')} />
        <NavButton active={activeTab === 'map'} icon={<MapIcon size={22} />} label="Map" onClick={() => setActiveTab('map')} />
        <NavButton active={activeTab === 'tools'} icon={<Smartphone size={22} />} label="Tools" onClick={() => setActiveTab('tools')} />
        <NavButton active={activeTab === 'chat'} icon={<MessageSquare size={22} />} label="Chat" onClick={() => setActiveTab('chat')} />
        <NavButton active={activeTab === 'settings'} icon={<Settings size={22} />} label="Set" onClick={() => setActiveTab('settings')} />
      </nav>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full md:max-w-md md:left-auto md:right-auto hidden md:block"></div>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-brand-pink scale-105' : 'text-gray-300 dark:text-slate-600 hover:text-gray-400'}`}>
      {icon}
      <span className="text-[8px] font-extrabold uppercase tracking-widest">{label}</span>
      {active && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-brand-pink rounded-full mt-0.5" />}
    </button>
  );
}

function AddContactForm({ onAdd }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (name && phone) {
      onAdd({ id: Date.now().toString(), name, phone });
      setName('');
      setPhone('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-brand-bg dark:border-slate-800 space-y-4">
      <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Connect New Squad Member</h3>
      <div className="space-y-3">
        <input 
          type="text" 
          placeholder="Contact Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-sm font-medium"
        />
        <input 
          type="tel" 
          placeholder="Phone Number" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-sm font-medium"
        />
      </div>
      <button 
        type="submit"
        className="w-full py-3.5 bg-brand-pink text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-brand-pink/20"
      >
        <Plus size={18} />
        Add to Squad
      </button>
    </form>
  );
}

function ToolCard({ icon, title, description, isActive, onClick }: any) {
   return (
      <button 
        onClick={onClick}
        className={`w-full text-left bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border transition-all ${isActive ? 'border-brand-pink/30 bg-brand-bg dark:bg-brand-pink/5' : 'border-pink-50 dark:border-slate-800'}`}
      >
         <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit mb-3">{icon}</div>
         <h3 className="font-bold text-xs leading-tight mb-1">{title}</h3>
         <p className="text-[9px] text-gray-400 font-medium leading-tight">{description}</p>
      </button>
   );
}

function Toggle({ enabled, onToggle }: any) {
  return (
    <button onClick={onToggle} className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${enabled ? 'bg-brand-pink' : 'bg-gray-200 dark:bg-slate-700'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}
