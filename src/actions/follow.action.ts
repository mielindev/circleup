"use server";

import prisma from "@/lib/prisma";
import { getUserIdInDB } from "./user.action";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@prisma/client";

const toggleFollow = async (targetUserId: string) => {
  try {
    const userId = await getUserIdInDB();

    if (!userId) return;

    if (targetUserId === userId) {
      throw new Error("You can't follow yourself");
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        // create notification
        prisma.notification.create({
          data: {
            type: NotificationType.FOLLOW,
            userId: targetUserId,
            creatorId: userId,
          },
        }),
      ]);
    }

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error following/unfollowing user:", error);
    return { success: false, error: "Error following/unfollowing user" };
  }
};

export { toggleFollow };
