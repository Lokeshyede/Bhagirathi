import React from "react";
import { Modal, Button } from "@bhagirathi/ui";
import { AlertTriangle } from "lucide-react";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center gap-4 text-center p-2">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 text-red-650 flex items-center justify-center animate-pulse">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">Are you absolutely sure?</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex gap-3 w-full mt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 cursor-pointer font-semibold"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-750 text-white font-semibold cursor-pointer"
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default DeleteDialog;
