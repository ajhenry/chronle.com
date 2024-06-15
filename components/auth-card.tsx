"use client";

import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export const AuthCard = () => {
  const [isShowingSignUp, setIsShowingSignUp] = useState<boolean>(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{isShowingSignUp ? "Sign Up" : "Sign In"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isShowingSignUp ? (
            <SignUpForm onShowLogin={() => setIsShowingSignUp(false)} />
          ) : (
            <SignInForm onShowSignUp={() => setIsShowingSignUp(true)} />
          )}
        </CardContent>
      </Card>
    </>
  );
};
