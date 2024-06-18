import { Footer } from "@/components/footer";
import { NavBar } from "@/components/navbar/navbar";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in overflow-x-hidden">
      <NavBar />
      <div className="flex flex-col grow h-full">{children}</div>
      <Footer />
    </div>
  );
}
