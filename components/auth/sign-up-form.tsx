"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { createUserData } from "@/lib/browser-firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCookie } from "cookies-next";
import {
  EmailAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  linkWithCredential,
} from "firebase/auth";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth, useUser } from "reactfire";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

interface SignUpFormProps {
  onShowLogin: () => void;
  onSignUp?: () => void;
}

export const SignUpForm: FC<SignUpFormProps> = ({ onShowLogin, onSignUp }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const auth = useAuth();
  const { data: userData } = useUser();

  const signUp = async ({ email, password }: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const credential = EmailAuthProvider.credential(email, password);

      let user: UserCredential;
      // First try linking with linkWithCredential, if that fails, sign in with popup
      try {
        if (userData && userData.isAnonymous) {
          user = await linkWithCredential(userData, credential);
        }
      } catch (err: any) {
        if (err.message.includes("auth/credential-already-in-use")) {
          user = await createUserWithEmailAndPassword(auth, email, password);
        }
      }

      // Update user data now
      await createUserData({
        uid: user!.user.uid,
        email: user!.user.email,
        displayName: user!.user.displayName,
        isAnonymous: false,
      });

      // Need to set the auth cookie too
      setCookie("auth", (user!.user as any).accessToken);

      // create user in firestore here if you want
      toast({ title: "Account created!" });
      onSignUp?.();
    } catch (err: any) {
      if ("code" in err && err.code.includes("already")) {
        toast({ title: "User already exists" });
      } else {
        toast({ title: "Error signing up", description: `${err}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(signUp)}>
          <fieldset disabled={isLoading} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be at least 8 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Sign Up</Button>
          </fieldset>
        </form>
      </Form>

      <p className="mt-4 text-sm">
        Already joined?{" "}
        <Button variant="link" onClick={onShowLogin}>
          Sign in instead.
        </Button>
      </p>
    </>
  );
};
