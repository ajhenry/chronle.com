import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";
import Link from "next/link";
import { FC } from "react";

export const NavBar: FC = () => {
  return (
    <>
      <div className="animate-in fade-in w-full">
        <nav className="container px-6 md:px-8 py-4">
          <div className="flex items-center">
            <Link href="/" className="transition-opacity">
              <div className="flex items-center">
                <span className="text-2xl font-semibold tracking-tighter  mr-6">
                  Chronle
                </span>
              </div>
            </Link>
            <div className="flex justify-between grow">
              <div></div>
              <div className="flex items-center space-x-4">
                <NavbarUserLinks />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};
