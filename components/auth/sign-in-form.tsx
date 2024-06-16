"use client";

import { ModalForgotPassword } from "@/components/auth/modal-forgot-password";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCookie } from "cookies-next";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "reactfire";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

interface SignInFormProps {
  onShowSignUp: () => void;
}

export const SignInForm: FC<SignInFormProps> = ({ onShowSignUp }) => {
  const auth = useAuth();
  const [isResetOpen, setIsResetOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async ({ email, password }: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const user = await signInWithEmailAndPassword(auth, email, password);

      // Need to set the auth cookie too
      setCookie("auth", (user!.user as any).accessToken);

      toast({
        title: "Success!",
        description: "You have been signed in.",
      });
    } catch (error) {
      toast({ title: "Error Signing In", description: `${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(login)} className="space-y-6">
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
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-sm">
        Forgot password?{" "}
        <Button variant="link" onClick={() => setIsResetOpen(true)}>
          Reset
        </Button>
      </p>
      <p className="text-sm">
        Not a member?{" "}
        <Button variant="link" onClick={onShowSignUp}>
          Sign up instead.
        </Button>
      </p>
      <ModalForgotPassword isOpen={isResetOpen} setIsOpen={setIsResetOpen} />
    </>
  );
};
