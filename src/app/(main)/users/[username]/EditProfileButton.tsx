"use client";

import { Button } from "@/components/ui/button";
import { UserProfileData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";

interface EditProfileButtonProps {
  user: UserProfileData;
  className?: string;
  label?: string;
}

export default function EditProfileButton({
  user,
  className,
  label = "Edit profile",
}: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className={cn(className)}
      >
        {label}
      </Button>
      <EditProfileDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
