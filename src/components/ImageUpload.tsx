"use client";

import { UploadDropZone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage";
}

const ImageUpload = ({ onChange, value, endpoint }: ImageUploadProps) => {
  if (value)
    return (
      <div className="relative size-40">
        <img
          src={value}
          alt="Image upload"
          className="rounded-md size-40 object-cover"
        />
        <button
          type="button"
          className="absolute top-0 right-0 p-1 bg-red-600 rounded-full shadow-sm"
          onClick={() => {
            onChange("");
          }}
        >
          <XIcon className="size-4 text-white" />
        </button>
      </div>
    );
  return (
    <UploadDropZone
      endpoint={endpoint}
      onClientUploadComplete={(req) => {
        onChange(req[0].ufsUrl);
      }}
      onUploadError={(error: Error) => console.error("Upload failed:", error)}
    />
  );
};

export default ImageUpload;
