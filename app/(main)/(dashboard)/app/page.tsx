import { Dashboard } from "@/components/dashboard/day-dashboard";

import { adminAuth, adminDB } from "@/lib/server-firebase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const getUserData = async () => {
  const cookieStore = cookies();
  const firebaseAuthToken = cookieStore.get("auth")?.value;

  if (!firebaseAuthToken) {
    console.log("no user token available for dashboard user data page");
    return null;
  }

  const token = await adminAuth
    .verifyIdToken(firebaseAuthToken)
    .catch((error) => {
      console.log("error verifying id token for initial standing", { error });
      return null;
    });

  if (!token) {
    return null;
  }

  const data = await adminDB.collection("users").doc(token.uid).get();

  return data;
};

const ApplicationPage = async () => {
  const userData = await getUserData();

  if (!userData) {
    redirect("/");
  }

  return <Dashboard />;
};
export default ApplicationPage;
