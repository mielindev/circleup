"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

const syncUser = async () => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!user || !userId) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser;

    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user?.firstName || ""} ${user?.lastName || ""}`,
        email: user?.emailAddresses[0].emailAddress,
        userName:
          user?.username ?? user?.emailAddresses[0].emailAddress.split("@")[0],
        image: user?.imageUrl,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error syncing user:", error);
  }
};

const getUserByClerkId = async (clerkId: string) => {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });
};

const getUserIdInDB = async () => {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user?.id;
};

const getRandomUser = async () => {
  try {
    const userId = await getUserIdInDB();

    if (!userId) return [];

    // get 3 random users exclude ourselves & users we already followed
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: userId,
            },
          },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        userName: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.error("Error getting random users:", error);
    return [];
  }
};

export { syncUser, getUserByClerkId, getUserIdInDB, getRandomUser };
