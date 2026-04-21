import { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData, useCollection } from 'react-firebase-hooks/firestore';
import { auth, db } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  deleteDoc,
  serverTimestamp,
  getDoc,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
import { Contact, LocationData, Journey, Evidence, LocationShare } from '../types';
import { capturePhoto, captureAudio } from '../services/EvidenceService';

export function useSafeGuard() {
  const [user, authLoading] = useAuthState(auth);
  
  // Real-time Firestore sync
  const [profileData] = useDocumentData(user ? doc(db, 'users', user.uid) : null);
  const [contactsSnap] = useCollection(user ? collection(db, 'users', user.uid, 'contacts') : null);
  const [evidenceSnap] = useCollection(user ? collection(db, 'users', user.uid, 'evidence') : null);

  // My Active Share (Optional: only one active share usually)
  const [myShare, setMyShare] = useState<LocationShare | null>(null);
  
  // Shares shared WITH me
  const [sharesSnap] = useCollection(
    user?.phoneNumber ? query(collection(db, 'shares'), where('sharedWith', 'array-contains', user.phoneNumber), where('status', '==', 'active')) : null
  );

  const [isSOSActive, setIsSOSActive] = useState(false);
  const [location, setLocation] = useState<LocationData>({ latitude: null, longitude: null, timestamp: Date.now() });
  const [battery, setBattery] = useState(100);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [journey, setJourney] = useState<Journey | null>(null);

  // Initialize user profile in Firestore if it doesn't exist
  useEffect(() => {
    if (user && !authLoading) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((snap) => {
        if (!snap.exists()) {
          setDoc(userRef, {
            phoneNumber: user.phoneNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            displayName: '',
            photoURL: ''
          });
        }
      });
    }
  }, [user, authLoading]);

  // Handle My Active Share logic
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'shares'), where('userId', '==', user.uid), where('status', '==', 'active'));
    // We could use useCollection for this too, but let's do it manually for precision if needed
    // or just assume one active share.
  }, [user]);

  // Sync my live location to my active share
  useEffect(() => {
    if (user && myShare && myShare.status === 'active' && location.latitude) {
      const shareRef = doc(db, 'shares', myShare.id);
      
      // Auto-expire check
      if (Date.now() > myShare.expiresAt) {
        updateDoc(shareRef, { status: 'expired' });
        setMyShare(null);
        return;
      }

      updateDoc(shareRef, {
        location,
        battery,
        updatedAt: serverTimestamp()
      });
    }
  }, [location, battery, myShare, user]);

  // Location Tracker
  useEffect(() => {
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: pos.timestamp,
          accuracy: pos.coords.accuracy
        };
        setLocation(newData);
        
        if (journey && journey.status === 'active') {
          setJourney(prev => prev ? ({ ...prev, path: [...prev.path, newData] }) : null);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    // Battery Monitor
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setBattery(Math.floor(bat.level * 100));
        bat.addEventListener('levelchange', () => {
          const level = Math.floor(bat.level * 100);
          setBattery(level);
        });
      });
    }

    return () => navigator.geolocation.clearWatch(id);
  }, [journey]);

  const startSharing = async (durationMinutes: number, targetPhoneNumbers: string[]) => {
    if (!user || !location.latitude) return;
    
    const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
    const shareData = {
      userId: user.uid,
      userName: (profileData as any)?.displayName || user.phoneNumber || 'SafeGuard User',
      location,
      battery,
      expiresAt,
      sharedWith: targetPhoneNumbers,
      status: 'active',
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'shares'), shareData);
    setMyShare({ id: docRef.id, ...shareData } as any);

    // Proactive Notification via WhatsApp
    const message = `🚨 Live Location Sharing started by ${shareData.userName}. View here: ${window.location.origin}`;
    const firstPhone = targetPhoneNumbers[0];
    if (firstPhone) {
      window.open(`https://wa.me/${firstPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const stopSharing = async () => {
    if (myShare) {
      await updateDoc(doc(db, 'shares', myShare.id), { status: 'expired' });
      setMyShare(null);
    }
  };

  const triggerSOS = async () => {
    setIsSOSActive(true);
    if (!user) return;

    // Collect evidence silently and store in Firestore
    for (let i = 0; i < 3; i++) {
      const photo = await capturePhoto();
      if (photo) {
        await addDoc(collection(db, 'users', user.uid, 'evidence'), {
          type: 'photo',
          data: photo,
          timestamp: Date.now(),
          location,
          createdAt: serverTimestamp()
        });
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    
    const audio = await captureAudio(10000);
    if (audio) {
      await addDoc(collection(db, 'users', user.uid, 'evidence'), {
        type: 'audio',
        data: audio,
        timestamp: Date.now(),
        location,
        createdAt: serverTimestamp()
      });
    }
  };

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'contacts'), {
      ...contact,
      createdAt: serverTimestamp()
    });
  };

  const removeContact = async (contactId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'contacts', contactId));
  };

  const stopSOS = () => setIsSOSActive(false);

  // Transform snapshots to data objects with IDs
  const contacts = contactsSnap ? contactsSnap.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as Contact[] : [];

  const evidence = evidenceSnap ? evidenceSnap.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as Evidence[] : [];

  const sharesWithMe = sharesSnap ? sharesSnap.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as LocationShare[] : [];

  return {
    user,
    profileData,
    authLoading,
    contacts, 
    setContacts: () => {}, 
    addContact,
    removeContact,
    isSOSActive, setIsSOSActive,
    location, setLocation,
    battery,
    theme, setTheme,
    evidence,
    journey, setJourney,
    triggerSOS, stopSOS,
    startSharing,
    stopSharing,
    myShare,
    sharesWithMe
  };
}
