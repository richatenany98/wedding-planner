import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  itemIcon?: React.ReactNode;
  itemDetails?: string;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemIcon,
  itemDetails,
  confirmText = "Delete",
  cancelText = "Cancel",
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-morphism border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {(itemName || itemIcon || itemDetails) && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              {itemIcon && (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100">
                  {itemIcon}
                </div>
              )}
              <div className="flex-1">
                {itemName && (
                  <h3 className="font-semibold text-neutral-800">{itemName}</h3>
                )}
                {itemDetails && (
                  <p className="text-sm text-neutral-600">{itemDetails}</p>
                )}
              </div>
            </div>
          )}
          <p className="text-neutral-600">{description}</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="hover:bg-white/20"
            >
              {cancelText}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 