"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createUserData } from "@/lib/browser-firebase";
import { setCookie } from "cookies-next";
import {
  GoogleAuthProvider,
  UserCredential,
  linkWithPopup,
  signInWithPopup,
} from "firebase/auth";
import { FC, useState } from "react";
import { useAuth, useUser } from "reactfire";

interface Props {
  onSignIn?: () => void;
}

export const ProviderLoginButtons: FC<Props> = ({ onSignIn }) => {
  const auth = useAuth();
  const { data: userData } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const doProviderSignIn = async (provider: GoogleAuthProvider) => {
    try {
      setIsLoading(true);
      console.log("Provider login", { providerId: provider.providerId });

      let user: UserCredential;

      // First try linking with popup, if that fails, sign in with popup
      try {
        if (userData && userData.isAnonymous) {
          console.log("Linking with popup");
          user = await linkWithPopup(userData, provider);
        } else {
          // This can happen when the game area doesn't load the anon user
          console.log("User isn't signed in, signing in with popup");
          user = await signInWithPopup(auth, provider);
        }
      } catch (error: any) {
        console.log("Error linking with popup", { err: error });
        if (error.message.includes("auth/credential-already-in-use")) {
          console.log("Credential was already in use, signing in with popup");
          user = await signInWithPopup(auth, provider);
        }
        throw error;
      }

      console.log("Signed in from provider login", { uid: user!.user.uid });

      // Update user data now
      await createUserData({
        uid: user!.user.uid,
        email: user!.user.email,
        displayName: user!.user.displayName,
        isAnonymous: false,
      });

      // Need to set the auth cookie too
      setCookie("auth", (user!.user as any).accessToken);

      // create user in your database here
      toast({ title: "Signed in!" });
      onSignIn?.();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error signing in", description: `${err}` });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Button
        className="w-full"
        disabled={isLoading}
        onClick={async () => {
          const provider = new GoogleAuthProvider();
          await doProviderSignIn(provider);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="1em"
          viewBox="0 0 488 512"
          fill="currentColor"
          className="mr-2"
        >
          <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
        </svg>
        Google
      </Button>
    </>
  );
};
