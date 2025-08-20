"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface DeleteAlterDialogProps {
  isOpenDialog: boolean;
  setIsOpenDialog: (isOpenDialog: boolean) => void;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  title?: string;
  description?: string;
}

const DeleteAlterDialog = ({
  isOpenDialog,
  setIsOpenDialog,
  onDelete,
  isDeleting,
  title = "Delete Post",
  description = "Are you sure you want to delete this post?",
}: DeleteAlterDialogProps) => {
  return (
    <AlertDialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-500 text-primary"
            onClick={onDelete}
          >
            {isDeleting ? (
              <>
                <span>Deleting...</span>
                <Loader2 className="animate-spin" />
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAlterDialog;
