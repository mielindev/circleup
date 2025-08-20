import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import UnauthorizedSidebar from "./ui/UnauthorizedSidebar";
import { Card, CardContent } from "./ui/card";
import { getUserByClerkId } from "@/actions/user.action";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { LinkIcon, MapPinIcon } from "lucide-react";

async function SideBar() {
  const authUser = await currentUser();
  if (!authUser) {
    return <UnauthorizedSidebar />;
  }

  const user = await getUserByClerkId(authUser.id);
  if (!user) {
    return null;
  }
  return (
    <div className="sticky top-20">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/profile/${user.userName}`}
              className="flex flex-col items-center justify-center"
            >
              <Avatar className="size-20 border-2">
                <AvatarImage src={user.image || "/avatar.png"} />
              </Avatar>

              <div className="mt-4 space-y-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.userName}</p>
              </div>
            </Link>

            {user.bio && (
              <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>
            )}

            <Separator className="my-4" />

            <div className="w-full">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{user._count.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <p className="font-medium">{user._count.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </div>
              <Separator className="my-4" />
            </div>

            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <MapPinIcon className="size-4 mr-2" />
                {user.location || "No location"}
              </div>

              {user.websites.length > 0 ? (
                user.websites.map((website) => (
                  <div className="flex items-center text-muted-foreground">
                    <LinkIcon className="size-4 mr-2" />
                    <a
                      href={website}
                      className="hover:underline truncate"
                      target="_blank"
                    >
                      {website}
                    </a>
                  </div>
                ))
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <LinkIcon className="size-4 mr-2" />
                  No website
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SideBar;
