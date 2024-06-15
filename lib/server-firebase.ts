import { Attempt, Day, Event, User } from "@/components/types/types";
import {
  App,
  AppOptions,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import KSUID from "ksuid";

export const config: AppOptions = {
  projectId: process.env.PROJECT_ID,
  credential: cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY,
  }),
};

let app: App;
if (!getApps().length) {
  if (process.env.NODE_ENV === "development") {
    process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
    process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099";
  }
  app = initializeApp(config);
}
export const adminDB = getFirestore(app!);
export const adminAuth = getAuth(app!);

const getServerTime = () => {
  const utc = new Date().toISOString().split("T")[0];
  return utc;
};

export const createInitialUser = async (uid: string) => {
  const user = await adminAuth.getUser(uid);

  // check if they exist
  const data = await adminDB.collection("users").doc(uid).get();

  if (data.exists) {
    return data.data() as User;
  }

  // TODO: maybe handle creating the user error?

  const userData: User = {
    uid: uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    solvedDays: {},
    admin: false,
    isAnonymous: true,
    stats: {
      totalDays: 0,
    },
  };

  const res = await adminDB
    .collection("users")
    .doc(uid)
    .set(userData, { merge: true });

  return userData;
};

export const getUser = async (uid: string) => {
  const db = getFirestore(app);
  const doc = db.collection("users").doc(uid);
  const snapshot = await doc.get();

  return snapshot.data() as User;
};

export const getToday = async () => {
  const dayTimestamp = getServerTime();

  try {
    const db = getFirestore(app);
    const doc = db.collection("days").doc(dayTimestamp);
    const snapshot = await doc.get();

    return snapshot.data() as Day;
  } catch (error) {
    console.error("Error getting today's day", { error });
    return null;
  }
};

export const uploadEvents = async (events: Omit<Event, "id">[]) => {
  const db = getFirestore(app);
  const collection = db.collection("events");
  const uid = KSUID.randomSync().toString();

  events.forEach(async (event) => {
    await collection.doc(uid).set({ ...event, id: uid });
  });
};

export const uploadDays = async (days: Day[]) => {
  const db = getFirestore(app);
  const collection = db.collection("days");

  days.forEach(async (day) => {
    await collection.doc(day.day).set(day);
  });
};

export const getLatestSubmittedSolution = async (uid: string) => {
  const day = getServerTime();
  const db = getFirestore(app);
  const collection = await db.collection(`attempts/${day}/${uid}`).get();
  const snapshot = collection.docs[collection.docs.length - 1];

  if (!snapshot) {
    return null;
  }

  return snapshot.data() as Attempt;
};

export const checkAnswer = async (date: string, events: string[]) => {
  const db = getFirestore(app);
  const doc = db.collection("days").doc(date);
  const snapshot = await doc.get();

  const day = snapshot.data() as Day;
  const solved = day.solution.every((id, index) => id === events[index]);

  // Identify which events are in the correct position
  const correct = events.map((_, index) => {
    return events[index] === day.solution[index];
  });

  return {
    solved,
    correct,
  };
};
