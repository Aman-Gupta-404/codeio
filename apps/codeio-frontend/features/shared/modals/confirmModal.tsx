import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  heading: string;
  message: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  confirmCta?: string;
}

function ConfirmModal(props: Props) {
  const {
    open,
    heading,
    message,
    onConfirm,
    onOpenChange,
    confirmCta = null,
  } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col gap-2">
        <DialogHeader>
          <DialogTitle className="text-transform: capitalize">
            {heading}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-2">
          <p>{message}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={onConfirm}>
            {confirmCta ? confirmCta : "Proceed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmModal;
