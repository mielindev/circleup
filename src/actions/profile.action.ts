"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserIdInDB } from "./user.action";

const getProfileByUsername = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        userName: username,
      },
      select: {
        id: true,
        name: true,
        userName: true,
        bio: true,
        image: true,
        location: true,
        websites: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            post: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error getting profile:", error);
    throw new Error("Error getting profile");
  }
};

const getUserPosts = async (userId: string) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            userName: true,
            image: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                userName: true,
                image: true,
              },
            },
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
    return posts;
  } catch (error) {
    console.error("Error getting user posts:", error);
    throw new Error("Error getting user posts");
  }
};

const getUserLikedPosts = async (userId: string) => {
  try {
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            userName: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                userName: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return likedPosts;
  } catch (error) {
    console.error("Error getting user liked posts:", error);
    throw new Error("Error getting user liked posts");
  }
};

const normalizeWebsites = (entries: string[]): string[] => {
  const out = new Set<string>();
  for (const entry of entries) {
    const hasLink = entry.trim();
    if (!hasLink) continue;
    const withProto =
      hasLink.startsWith("http://") || hasLink.startsWith("https://")
        ? hasLink
        : `https://${hasLink}`;
    try {
      out.add(new URL(withProto).toString());
    } catch {}
  }
  return Array.from(out);
};

const updateUserProfile = async (formData: FormData) => {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId)
      throw new Error(
        "Unauthorized - You have no permission to update this profile."
      );

    const coerceString = (value: FormDataEntryValue | null): string =>
      typeof value === "string" ? value : "";

    const toNull = (value: string) => {
      const temp = value.trim();
      return temp === "" ? null : temp;
    };

    const name = toNull(coerceString(formData.get("name")));
    const bio = toNull(coerceString(formData.get("bio")));
    const location = toNull(coerceString(formData.get("location")));

    const websitesRaw = formData
      .getAll("websites")
      .filter((value): value is string => typeof value === "string");

    const websites =
      websitesRaw.length > 0 ? normalizeWebsites(websitesRaw) : undefined;

    const updated = await prisma.user.update({
      where: {
        clerkId,
      },
      data: {
        name,
        bio,
        location,
        ...(websites !== undefined ? { websites } : {}),
      },
      select: {
        userName: true,
      },
    });
    revalidatePath(`/profile/${updated.userName}`);
    return { success: true, updated };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Error updating profile" };
  }
};

const isFollowing = async (userId: string) => {
  const currentUserId = await getUserIdInDB();
  if (!currentUserId) return false;

  try {
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking if following:", error);
    return false;
  }
};

export {
  getProfileByUsername,
  getUserLikedPosts,
  updateUserProfile,
  getUserPosts,
  isFollowing,
};
