import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import NotFound from "@/app/not-found";
import ProfilePageClient from "./ProfilePageClient";
import { getUserIdInDB } from "@/actions/user.action";

export const generateMetadata = async ({
  params,
}: {
  params: { username: string };
}) => {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: user.name ?? user.userName,
    description: user.bio || `Check out ${user.name}'s profile`,
  };
};

const ProfilePageServer = async ({
  params,
}: {
  params: { username: string };
}) => {
  const user = await getProfileByUsername(params.username);
  const currentUserId = await getUserIdInDB();

  if (!user) return <NotFound />;

  const [posts, likedPosts, currentFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      currentFollowing={currentFollowing}
      currentUserId={currentUserId}
    />
  );
};

export default ProfilePageServer;
