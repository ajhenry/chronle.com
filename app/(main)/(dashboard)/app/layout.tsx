import Link from "next/link";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container border-t pt-12 animate-in fade-in">
      <ul className="flex flex-row underline space-x-4 text-lg mb-8">
        <li>
          <Link href="/app">Days</Link>
        </li>
        <li>
          <Link href="/app/events">Events</Link>
        </li>
      </ul>
      {children}
    </div>
  );
}
