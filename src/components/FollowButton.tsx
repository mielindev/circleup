"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toggleFollow } from "@/actions/follow.action";
import toast from "react-hot-toast";

const FollowButton = ({ userId }: { userId: string }) => {
  const [isFollowing, setisFollowing] = useState(false);
  const handleFollow = async () => {
    setisFollowing(true);
    try {
      const res = await toggleFollow(userId);
      if (res?.success) {
        toast.success("Followed successfully");
      }
    } catch (error) {
    } finally {
      setisFollowing(false);
    }
  };
  return (
    <Button
      onClick={handleFollow}
      variant={"secondary"}
      size={"sm"}
      className="w-20"
      disabled={isFollowing}
    >
      {isFollowing ? <Loader2 className="size-4 animate-spin" /> : "Follow"}
    </Button>
  );
};

export default FollowButton;
