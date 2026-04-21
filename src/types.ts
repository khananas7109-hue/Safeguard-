export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  timestamp: number;
  accuracy?: number;
}

export interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

export interface Journey {
  id: string;
  startTime: number;
  endTime?: number;
  path: LocationData[];
  expectedDuration: number; // in minutes
  status: 'active' | 'completed' | 'overdue';
}

export interface Evidence {
  id: string;
  type: 'photo' | 'audio';
  data: string; // base64 or blob url
  timestamp: number;
  location?: LocationData;
}

export interface LocationShare {
  id: string;
  userId: string;
  userName: string;
  location: LocationData;
  battery: number;
  expiresAt: number;
  sharedWith: string[]; // phone numbers
  status: 'active' | 'expired';
}

export interface AppState {
  theme: 'light' | 'dark' | 'auto';
  isSOSActive: boolean;
  contacts: Contact[];
  safeZones: SafeZone[];
  journeys: Journey[];
  evidence: Evidence[];
  checkInInterval: number; // in minutes
  lastCheckIn: number;
}
