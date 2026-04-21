import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

console.log(`Connecting to Firestore Database: ${firebaseConfig.firestoreDatabaseId || '(default)'} in project ${firebaseConfig.projectId}`);

// Connectivity check as per instructions
async function testConnection() {
  try {
    // We use getDocFromServer to force a network request and bypass cache
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test: SUCCESS");
  } catch (error: any) {
    console.error("Firestore connection failed details:", {
      code: error.code,
      message: error.message,
      name: error.name
    });
    
    if (error?.code === 'permission-denied') {
      console.log("Firestore reachability confirmed (Permission Denied is expected).");
    } else if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.error("CRITICAL: Could not reach Firestore. This often means the database ID or Project ID in firebase-applet-config.json is incorrect, or the database hasn't been created yet.");
      console.error("ACTION REQUIRED: Please use the 'Set up Firebase' tool in the sidebar to re-provision the database.");
    }
  }
}
testConnection();
