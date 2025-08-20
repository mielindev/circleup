"use client";

import {
  getNotifications,
  markNotificationAsRead,
  Notification,
} from "@/actions/notification.action";
import NotificationSkeleton from "@/components/NotificationSkeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircle, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "FOLLOW":
      return <UserPlusIcon className="h-4 w-4 text-green-600" />;
    case "LIKE":
      return <HeartIcon className="h-4 w-4 text-red-600" />;
    case "COMMENT":
      return <MessageCircle className="h-4 w-4 text-blue-600" />;
    default:
      return null;
  }
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();

        if (!mounted) return;
        setNotifications(data);

        const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length > 0) {
          setNotifications((prev) =>
            prev.map((n) =>
              unreadIds.includes(n.id) ? { ...n, read: true } : n
            )
          );
        }
        await markNotificationAsRead(unreadIds);
      } catch (error) {
        toast.error("Failed to fetch notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) return <NotificationSkeleton />;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <span className="text-sm text-muted-foreground">
              {notifications.filter((n) => !n.read).length} unread
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <span>No notifications</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 border-b hover:bg-muted/75 transition-colors ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  <Avatar className="mt-1">
                    <AvatarImage
                      src={notification.creator.image || "/avatar.png"}
                    />
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span>
                        <span className="font-medium">
                          {notification.creator.name ??
                            notification.creator.userName}
                        </span>
                        {notification.type === NotificationType.FOLLOW
                          ? " started following you"
                          : notification.type === NotificationType.LIKE
                          ? " liked your post"
                          : " commented on your post"}
                      </span>
                    </div>

                    {notification.post &&
                      (notification.type === NotificationType.COMMENT ||
                        notification.type === NotificationType.LIKE) && (
                        <div className="pl-6 space-y-2">
                          <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                            <p>{notification.post.content}</p>
                            {notification.post.image && (
                              <img
                                src={notification.post.image}
                                alt="Post image"
                                className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover "
                              />
                            )}
                          </div>

                          {notification.type === NotificationType.COMMENT &&
                            notification.comment && (
                              <div className="text-sm p-2 bg-accent/50 rounded-md">
                                {notification.comment.content}
                              </div>
                            )}
                        </div>
                      )}

                    <p className="text-sm text-muted-foreground pl-6">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPage;
