"use client";
import {
  createComment,
  deletePost,
  Post,
  toggleLike,
} from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { formatDistanceToNow, set } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  HeartIcon,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  TrashIcon,
} from "lucide-react";
import DeleteAlterDialog from "./DeleteAlterDialog";
import { Textarea } from "./ui/textarea";

const PostCard = ({ post, userId }: { post: Post; userId: string | null }) => {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.userId === userId)
  );
  const [likes, setLikes] = useState(post._count.likes);
  const [showComment, setShowComment] = useState(false);
  const permissionToDel = userId === post.authorId;

  const openConfirm = () => {
    setIsOpenPopover(false);
    setIsOpenDialog(true);
  };

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === userId));
    } finally {
      setIsLiking(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || isCommenting) return;

    try {
      setIsCommenting(true);
      const res = await createComment(post.id, newComment);
      if (res?.success) {
        toast.success("Comment created successfully");
        setNewComment("");
      }
    } catch (error) {
      toast.error("Failed to create comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!permissionToDel || isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await deletePost(post.id);
      if (res?.success) {
        toast.success("Post deleted successfully");
      } else {
        throw new Error(res?.error);
      }
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.userName}`}>
              <Avatar className="size-8 sm:size-10">
                <AvatarImage src={post.author.image || "/avatar.png"} />
                <AvatarFallback>{post.author.name}</AvatarFallback>
              </Avatar>
            </Link>
            {/* Post header */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Link
                  href={`/profile/${post.author.userName}`}
                  className="font-semibold truncate"
                >
                  {post.author.name}
                </Link>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Link href={`profile/${post.author.userName}`}>
                    @{post.author.userName}
                  </Link>
                  <span>&#8226;</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true })}{" "}
                    ago
                  </span>
                </div>

                <Popover open={isOpenPopover} onOpenChange={setIsOpenPopover}>
                  <PopoverTrigger asChild>
                    <Button variant={"ghost"} size={"sm"}>
                      <MoreHorizontal className="size-4 p-0" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-44 p-2" align="end">
                    <div className="flex flex-col gap-1">
                      {permissionToDel && (
                        <Button
                          variant={"ghost"}
                          size={"sm"}
                          onClick={openConfirm}
                          className="w-full flex items-center justify-between px-2 text-red-600 hover:text-red-600"
                        >
                          <span>Remove post</span>
                          <TrashIcon className="size-4" />
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <DeleteAlterDialog
                  isDeleting={isDeleting}
                  onDelete={handleDeletePost}
                  setIsOpenDialog={setIsOpenDialog}
                  isOpenDialog={isOpenDialog}
                />
              </div>
            </div>
          </div>
          {/* Post content */}
          <p className="mt- text-sm text-foreground break-words">
            {post.content}
          </p>
          {/* Post image */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt="Post Content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Likes and comments section */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant={"ghost"}
                size={"icon"}
                className={`text-muted-foreground gap-2 ${
                  hasLiked
                    ? "text-red-600 hover:text-red-500"
                    : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{likes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className="text-muted-foreground gap-2"
                >
                  <HeartIcon className="size-5" />
                  <span>{likes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant={"ghost"}
              size={"icon"}
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setShowComment((prev) => !prev)}
            >
              <MessageCircle
                className={`size-5 ${
                  showComment ? "fill-blue-600 text-blue-600" : ""
                }`}
              />
              <span>{post._count.comments}</span>
            </Button>
          </div>

          {showComment && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4">
                {/* Display comments */}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage
                        src={comment.author.image || "/avatar.png"}
                        alt={comment.author.name || "User"}
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          @{comment.author.userName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          &#8226;
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, {
                            addSuffix: true,
                          })}{" "}
                          ago
                        </span>
                      </div>

                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* If user is logged in, show the comment input */}
              {user ? (
                <div className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a comment ..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                      disabled={isCommenting}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant={"default"}
                        size={"sm"}
                        className="flex items-center gap-2"
                        disabled={isCommenting || !newComment.trim()}
                        onClick={handleCreateComment}
                      >
                        {isCommenting ? (
                          <>
                            <span>Posting...</span>
                            <Loader2 className="size-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            <Send className="size-4" />
                            <span>Comment</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
