export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import ModeToggle from "./ModeToggle";
import { Button } from "./ui/button";
import Link from "next/link";
import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

async function DesktopNavbar() {
  const user = await currentUser();

  const profileSlug =
    user?.username ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "me";

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant={"ghost"} className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="size-4" />
          <span className="hidden md:inline-block">Home</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant={"ghost"} className="flex items-center gap-2" asChild>
            <Link href="/notifications">
              <BellIcon className="size-4" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>

          <Button variant={"ghost"} className="flex items-center gap-2" asChild>
            <Link href={`/profile/${profileSlug}`}>
              <UserIcon className="size-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </>
      ) : (
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant={"default"}>Sign In</Button>
          </SignInButton>
        </SignedOut>
      )}
    </div>
  );
}

export default DesktopNavbar;
