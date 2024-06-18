import { User } from "@/components/types/types";
import { FirebaseOptions, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

export const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

export const browserApp = initializeApp(config);

if (process.env.NODE_ENV === "development") {
  const auth = getAuth();
  const firestore = getFirestore();
  connectAuthEmulator(auth, "http://127.0.0.1:9099");

  connectFirestoreEmulator(firestore, "localhost", 8080);
}

export const createUserData = async (data: Partial<User>) => {
  await setDoc(
    doc(collection(getFirestore(browserApp), "users"), data.uid),
    {
      ...data,
    },
    { merge: true }
  );

  console.log("createUserData doc set", { data });
};
