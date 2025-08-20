"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ImageIcon, Loader2, SendIcon } from "lucide-react";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";

type NewPost = {
  content: string;
  image: string;
};

const CreatePost = () => {
  const { user } = useUser();
  const [isPosting, setIsPosting] = useState(false);
  const [post, setPost] = useState<NewPost>({
    content: "",
    image: "",
  });
  const [showUploadZone, setShowUploadZone] = useState(false);

  const handleSubmit = async () => {
    if (!post.content && !post.image) return;
    setIsPosting(true);
    try {
      const res = await createPost(post.content, post.image);
      if (res?.success) {
        setPost({ content: "", image: "" });
        setShowUploadZone(false);
        toast.success("Post created successfully");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="size-10">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
              <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[80px] resize-none border-none focus:visible:ring-0 px-4 text-base"
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              disabled={isPosting}
            />
          </div>

          <Separator className="my-4" />

          {(showUploadZone || post.image) && (
            <div className="border rounded-lg">
              <ImageUpload
                endpoint="postImage"
                value={post.image}
                onChange={(url) => {
                  setPost({ ...post, image: url });
                  if (!url) setShowUploadZone(false);
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="flex space-x-2">
              <Button
                variant={"ghost"}
                size="sm"
                className="text-muted-foreground hover:text-primary flex items-center"
                onClick={() => setShowUploadZone(true)}
              >
                <ImageIcon className="size-4" />
                <span>Photo</span>
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={"default"}
                size="sm"
                className="flex items-center"
                disabled={
                  (post.content.trim() === "" && !post.image) || isPosting
                }
                onClick={handleSubmit}
              >
                {isPosting ? (
                  <>
                    <span>Posting</span>
                    <Loader2 className="animate-spin" />
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4 mr-2" />
                    <span>Post</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
