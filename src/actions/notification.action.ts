"use server";

import prisma from "@/lib/prisma";
import { getUserIdInDB } from "./user.action";
import { Prisma } from "@prisma/client";

const notificaitonInClude = Prisma.validator<Prisma.NotificationDefaultArgs>()({
  include: {
    creator: {
      select: {
        id: true,
        name: true,
        userName: true,
        image: true,
      },
    },
    post: {
      select: {
        id: true,
        content: true,
        image: true,
      },
    },
    comment: {
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    },
  },
});

type NotificationRelations = Prisma.NotificationGetPayload<
  typeof notificaitonInClude
>;

const getNotifications = async (): Promise<NotificationRelations[]> => {
  try {
    const userId = await getUserIdInDB();

    if (!userId) return [] as NotificationRelations[];

    return await prisma.notification.findMany({
      where: {
        userId,
      },
      include: notificaitonInClude.include,
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [] as NotificationRelations[];
  }
};

const markNotificationAsRead = async (notificationIds: string[]) => {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false };
  }
};

export type Notifications = Awaited<ReturnType<typeof getNotifications>>;

export type Notification = Notifications[number];

export { getNotifications, markNotificationAsRead };
