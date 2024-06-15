"use client";

import { UserNav } from "@/components/navbar/user-nav";
import { buttonVariants } from "@/components/ui/button";
import { browserApp } from "@/lib/browser-firebase";
import { collection, doc, getFirestore } from "firebase/firestore";
import Link from "next/link";
import { FC } from "react";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { useUser } from "reactfire";

export const NavbarUserLinks: FC = () => {
  const { data, hasEmitted } = useUser();
  const [userData] = useDocumentDataOnce(
    doc(
      collection(getFirestore(browserApp), "users"),
      data?.uid ?? "__MISSING__"
    )
  );

  return (
    <>
      {hasEmitted && data && !data.isAnonymous ? (
        <>
          <Link href="/app" className={buttonVariants()}>
            Dashboard
          </Link>
          <UserNav />
        </>
      ) : (
        <>
          <Link href="/login" className={buttonVariants()}>
            Login &rarr;
          </Link>
        </>
      )}
    </>
  );
};
