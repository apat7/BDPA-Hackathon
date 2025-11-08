import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, collection, doc, setDoc, getDocs, deleteDoc, query, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;

// Function to save a custom job for a user
export const saveUserJob = async (userId: string, jobData: any) => {
  if (!userId) {
    throw new Error("User ID is required to save a job.");
  }
  if (!jobData || !jobData.id) {
    throw new Error("Job data and job ID are required to save a job.");
  }
  
  // Sanitize the job ID to ensure it's valid for Firestore
  const sanitizedId = jobData.id.toString().replace(/[\/]/g, '_');
  
  try {
    const userJobRef = doc(collection(db, "users", userId, "user_jobs"), sanitizedId);
    await setDoc(userJobRef, { ...jobData, id: sanitizedId }, { merge: true });
  } catch (error: any) {
    console.error("Firestore save error:", error);
    // Re-throw with more context
    throw new Error(`Failed to save job to Firestore: ${error.message || error.code || 'Unknown error'}`);
  }
};

// Function to fetch all custom jobs for a user
export const fetchUserJobs = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required to fetch jobs.");
  }
  const userJobsCollectionRef = collection(db, "users", userId, "user_jobs");
  const q = query(userJobsCollectionRef);
  const querySnapshot = await getDocs(q);
  const jobs: any[] = [];
  querySnapshot.forEach((doc) => {
    jobs.push({ id: doc.id, ...doc.data() });
  });
  return jobs;
};

// Function to delete a custom job for a user
export const deleteUserJob = async (userId: string, jobId: string) => {
  if (!userId || !jobId) {
    throw new Error("User ID and Job ID are required to delete a job.");
  }
  const userJobRef = doc(db, "users", userId, "user_jobs", jobId);
  await deleteDoc(userJobRef);
};

// Function to save a focused position for a user
export const saveFocusedPosition = async (userId: string, positionId: string) => {
  if (!userId || !positionId) {
    throw new Error("User ID and Position ID are required to save a focused position.");
  }
  const focusedPositionRef = doc(collection(db, "users", userId, "focused_positions"), positionId);
  await setDoc(focusedPositionRef, {
    positionId: positionId,
    focusedAt: new Date().toISOString(),
  }, { merge: true });
};

// Function to remove a focused position for a user
export const removeFocusedPosition = async (userId: string, positionId: string) => {
  if (!userId || !positionId) {
    throw new Error("User ID and Position ID are required to remove a focused position.");
  }
  const focusedPositionRef = doc(db, "users", userId, "focused_positions", positionId);
  await deleteDoc(focusedPositionRef);
};

// Function to fetch all focused position IDs for a user
export const fetchFocusedPositions = async (userId: string): Promise<string[]> => {
  if (!userId) {
    throw new Error("User ID is required to fetch focused positions.");
  }
  const focusedPositionsCollectionRef = collection(db, "users", userId, "focused_positions");
  const querySnapshot = await getDocs(focusedPositionsCollectionRef);
  const positionIds: string[] = [];
  querySnapshot.forEach((doc) => {
    positionIds.push(doc.id);
  });
  return positionIds;
};

// Function to check if a position is focused by a user
export const isPositionFocused = async (userId: string, positionId: string): Promise<boolean> => {
  if (!userId || !positionId) {
    return false;
  }
  const focusedPositionRef = doc(db, "users", userId, "focused_positions", positionId);
  const focusedPositionDoc = await getDoc(focusedPositionRef);
  return focusedPositionDoc.exists();
};
