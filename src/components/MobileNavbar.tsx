"use client";
import { BellIcon, HomeIcon, LogOut, MenuIcon, UserIcon } from "lucide-react";
import ModeToggle from "./ModeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  SignedIn,
  SignOutButton,
  SignedOut,
  SignInButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";
import { useState } from "react";

const MobileNavbar = () => {
  const [showMobileMenu, setshowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const profileSlug =
    user?.username ?? user?.primaryEmailAddress?.emailAddress.split("@")[0];
  return (
    <div className="flex md:hidden items-center space-x-2">
      <ModeToggle />

      <Sheet open={showMobileMenu} onOpenChange={setshowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant={"ghost"} size={"icon"}>
            <MenuIcon className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side={"right"} className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col space-y-4 mt-6">
            <Button
              variant={"ghost"}
              className="flex items-center gap-3 justify-start"
              asChild
            >
              <Link href="/" onClick={() => setshowMobileMenu(false)}>
                <HomeIcon className="size-4" />
                <span className="text-md">Home</span>
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button
                  variant={"ghost"}
                  className="flex items-center gap-3 justify-start"
                  asChild
                >
                  <Link
                    href="/notifications"
                    onClick={() => setshowMobileMenu(false)}
                  >
                    <BellIcon className="size-4" />
                    <span className="text-md">Notifications</span>
                  </Link>
                </Button>

                <Button
                  variant={"ghost"}
                  className="flex items-center gap-3 justify-start"
                  asChild
                >
                  <Link
                    href={`/profile${profileSlug}`}
                    onClick={() => setshowMobileMenu(false)}
                  >
                    <UserIcon className="size-4" />
                    <span className="text-md">Profile</span>
                  </Link>
                </Button>

                <SignedIn>
                  <SignOutButton>
                    <Button
                      variant={"ghost"}
                      className="flex items-center gap-3 justify-start"
                    >
                      <LogOut className="size-4" />
                      <span className="text-md">Logout</span>
                    </Button>
                  </SignOutButton>
                </SignedIn>
              </>
            ) : (
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant={"default"}>Sign In</Button>
                </SignInButton>
              </SignedOut>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavbar;
