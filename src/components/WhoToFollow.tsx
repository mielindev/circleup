import { getRandomUser } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import FollowButton from "./FollowButton";

const WhoToFollow = async () => {
  const randomUsers = await getRandomUser();

  if (randomUsers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who to follow</CardTitle>
      </CardHeader>
      <CardContent>
        {randomUsers.map((user) => (
          <div
            key={user.id}
            className="flex gap-2 items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Link href={`/profile/${user.userName}`}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.image || "/avatar.png"} />
                  <AvatarFallback>{user.name}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col text-xs">
                <Link
                  href={`/profile/${user.userName}`}
                  className="font-semibold cursor-pointer"
                >
                  {user.name}
                </Link>
                <p className="text-muted-foreground">@{user.userName}</p>
                <p className="text-muted-foreground">
                  {user._count.followers} followers
                </p>
              </div>
            </div>
            <FollowButton userId={user.id} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WhoToFollow;
