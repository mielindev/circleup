"use server";

import prisma from "@/lib/prisma";
import { getUserIdInDB } from "./user.action";
import { revalidatePath } from "next/cache";
import { NotificationType, Prisma } from "@prisma/client";

const createPost = async (content: string, image: string) => {
  try {
    const userId = await getUserIdInDB();

    if (!userId) return;

    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content,
        image,
      },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: "Error creating post" };
  }
};

// Set inclueded fields for post
const postInclude = Prisma.validator<Prisma.PostDefaultArgs>()({
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
});

// Generated types based on postInclude
type PostWithRelations = Prisma.PostGetPayload<typeof postInclude>;

const getPosts = async (): Promise<PostWithRelations[]> => {
  try {
    return await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: postInclude.include,
    });
  } catch (error) {
    console.error("Error getting posts:", error);
    return [] as PostWithRelations[];
  }
};

// Extracted types that represents the result of getPosts
export type Posts = Awaited<ReturnType<typeof getPosts>>;

// Extracted type that represents a single post
export type Post = Posts[number];

const toggleLike = async (postId: string) => {
  try {
    const userId = await getUserIdInDB();

    if (!userId) return;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new Error("Post not found");

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId === userId
          ? []
          : [
              prisma.notification.create({
                data: {
                  type: NotificationType.LIKE,
                  userId: post.authorId,
                  creatorId: userId,
                  postId: postId,
                },
              }),
            ]),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, error: "Error toggling like" };
  }
};

const createComment = async (postId: string, content: string) => {
  try {
    const userId = await getUserIdInDB();

    if (!userId) return;
    if (!content) throw new Error("Comment cannot be empty");

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new Error("Post not found");

    // Create new comment
    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          authorId: userId,
          postId,
          content,
        },
      });

      // Create notification
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: NotificationType.COMMENT,
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Error creating comment" };
  }
};

const deletePost = async (postId: string) => {
  try {
    const userId = await getUserIdInDB();

    if (!userId) return;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("Post not found");

    if (post.authorId !== userId)
      throw new Error(
        "Unauthorized - You have no permission to delete this post."
      );

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/");
    return { success: true, message: "Post deleted successfully" };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Error deleting post" };
  }
};

export { createPost, getPosts, toggleLike, createComment, deletePost };
