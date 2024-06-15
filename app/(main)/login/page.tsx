"use client";

import { AuthCard } from "@/components/auth-card";
import { ProviderLoginButtons } from "@/components/auth/provider-login-buttons";
import { OrSeparator } from "@/components/ui/or-separator";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "reactfire";

export default function LoginPage() {
  const { data: user, status } = useUser();
  const router = useRouter();

  useEffect(() => {
    // We want the user to be signed in to a real account
    // otherwise they can upgrade
    console.log("user", user, status, user?.isAnonymous);
    if (user && !user.isAnonymous && status === "success") {
      router.push("/");
    }
  }, [user, status, user?.isAnonymous]);

  return (
    <div className="grow flex flex-col items-center justify-center">
      <section className="sm:w-[32rem] space-y-4 w-full p-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Login
        </h1>
        <AuthCard />
        <OrSeparator />
        <ProviderLoginButtons />
      </section>
    </div>
  );
}
