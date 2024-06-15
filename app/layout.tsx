import "@/app/globals.css";
import { MyFirebaseProvider } from "@/components/firebase-providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { TrpcProvider } from "@/providers/trpc-provider";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chrondle - A game about knowing dates",
  description:
    "Chrondle. A game about knowing dates of events. Get 6 chances to get the timeline of events right.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(font.className, "bg-background")}>
        <ThemeProvider>
          <MyFirebaseProvider>
            <TrpcProvider>
              {children}
              <Toaster />
            </TrpcProvider>
          </MyFirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
