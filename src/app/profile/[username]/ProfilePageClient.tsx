"use client";

import {
  getProfileByUsername,
  updateUserProfile,
} from "@/actions/profile.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDown,
  FileIcon,
  HeartIcon,
  LinkIcon,
  Loader2,
  MapIcon,
  OctagonMinus,
  SquarePlus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { Posts } from "@/actions/post.action";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/follow.action";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countriesList } from "@/lib/countries";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  currentFollowing: boolean;
  currentUserId: string | null;
}
const ProfilePageClient = ({
  user,
  posts,
  likedPosts,
  currentFollowing,
  currentUserId,
}: ProfilePageClientProps) => {
  const { user: currentUser } = useUser();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isFollowing, setIsFollowing] = useState(currentFollowing);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpenSelectLocation, setIsOpenSelectLocation] = useState(false);

  const [updateData, setUpdateData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    websites: user.websites || [],
  });

  const addWebsite = () => {
    setUpdateData((prev) => ({
      ...prev,
      websites: [...(prev.websites ?? []), ""],
    }));
  };

  const removeWebsite = (idx: number) => {
    setUpdateData((prev) => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== idx),
    }));
  };

  const updateWebsite = (idx: number, website: string) => {
    setUpdateData((prev) => {
      const next = [...prev.websites];
      next[idx] = website;
      return { ...prev, websites: next };
    });
  };

  const isOwnProfile =
    currentUser?.username === user.userName ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.userName;

  const handleSubmit = async () => {
    console.log(updateData);
    const formData = new FormData();

    formData.append("name", updateData.name);
    formData.append("bio", updateData.bio);
    formData.append("location", updateData.location);
    updateData.websites.length === 0
      ? formData.append("websites", "")
      : updateData.websites.forEach((website) => {
          formData.append("websites", website);
        });
    try {
      setIsUpdating(true);
      const res = await updateUserProfile(formData);

      if (res.success) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
      setShowEditDialog(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setIsUpdatingFollow(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-24">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">
                  {user.name ?? user.userName}
                </h1>
                <p className="text-muted-foreground">@{user.userName}</p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* Profile stats */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="font-semibold">
                        {user._count.followers.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Followers
                      </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold">
                        {user._count.following.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Following
                      </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold">
                        {posts.length.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* Profile actions (follow, unfollow, edit) */}
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button variant={"default"} className="w-full mt-4">
                      Follow
                    </Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button
                    variant={"default"}
                    className="w-full mt-4"
                    onClick={() => setShowEditDialog(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    className="w-full mt-4"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}

                {/* Location and websites */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.websites.length > 0 &&
                    user.websites.map((website) => (
                      <div
                        key={website}
                        className="flex items-center text-muted-foreground"
                      >
                        <LinkIcon className="size-4 mr-2" />
                        <a
                          href={website}
                          className="hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {website}
                        </a>
                      </div>
                    ))}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {format(user.createdAt, "MMMM yyyy")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs className="w-full" defaultValue="posts">
          <TabsList>
            <TabsTrigger
              value={"posts"}
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <FileIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value={"likes"}
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} userId={currentUserId} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No posts yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <PostCard key={post.id} post={post} userId={currentUserId} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No liked posts to show
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. You can change your name,
                bio, and location.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={updateData.name}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  value={updateData.bio}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, bio: e.target.value })
                  }
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Popover
                  open={isOpenSelectLocation}
                  onOpenChange={setIsOpenSelectLocation}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {updateData.location ? (
                        (() => {
                          const c = countriesList.find(
                            (x) => x.label === updateData.location
                          );
                          return <span>{c?.label}</span>;
                        })()
                      ) : (
                        <span>Select Location</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-hidden">
                        <ScrollArea>
                          {countriesList.map((c) => (
                            <CommandItem
                              key={c.value}
                              value={c.label}
                              onSelect={() => {
                                setUpdateData({
                                  ...updateData,
                                  location: c.label,
                                });
                                setIsOpenSelectLocation(false);
                              }}
                            >
                              <CheckIcon className="mr-2 size-4" />
                              {c.label}
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Input
                type="hidden"
                name="location"
                value={updateData.location || ""}
              />

              {/* <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={updateData.location}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, location: e.target.value })
                  }
                  placeholder="Your location"
                />
              </div> */}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Website</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addWebsite}
                  >
                    <SquarePlus className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {(updateData.websites ?? []).map((website, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      name="website"
                      placeholder="Your website"
                      value={website}
                      onChange={(e) => updateWebsite(idx, e.target.value)}
                      inputMode="url"
                      autoComplete="url"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size={"lg"}
                      aria-label="Remove Website"
                      onClick={() => removeWebsite(idx)}
                    >
                      <OctagonMinus className="size-10 font-bold text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <DialogClose asChild>
                <Button variant={"outline"}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProfilePageClient;
