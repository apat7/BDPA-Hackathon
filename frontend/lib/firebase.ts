import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, collection, doc, setDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";

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
  const userJobRef = doc(collection(db, "users", userId, "user_jobs"), jobData.id);
  await setDoc(userJobRef, jobData, { merge: true });
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
