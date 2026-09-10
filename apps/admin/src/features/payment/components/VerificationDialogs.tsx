import React, { useState } from "react";
import { Modal, Button } from "@bhagirathi/ui";

interface ApproveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  amount: number;
  reference: string;
}

export const ApproveDialog: React.FC<ApproveDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  amount,
  reference
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Payment">
      <div className="space-y-4">
        <p className="text-xs text-text-secondary dark:text-gray-400 font-medium leading-relaxed">
          Are you sure you want to approve and verify the payment for reference <span className="font-extrabold text-primaryText dark:text-white select-all">{reference}</span>?
        </p>

        <div className="bg-green-50/50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 p-4 rounded-card text-center">
          <span className="text-xxs text-green-700 dark:text-green-455 font-bold uppercase tracking-wider block">Total Amount to Verify</span>
          <span className="text-xl font-black text-green-700 dark:text-green-400 mt-1 block">₹{amount.toLocaleString("en-IN")}</span>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-border dark:border-gray-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 font-bold uppercase tracking-wider cursor-pointer"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider cursor-pointer"
            isLoading={isLoading}
          >
            Confirm Approve
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; remarks: string }) => void;
  isLoading?: boolean;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a rejection reason.");
      return;
    }
    if (reason === "Other" && !remarks.trim()) {
      setError("Remarks are required for 'Other' reason.");
      return;
    }
    setError("");
    onConfirm({ reason, remarks });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Payment Receipt">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted font-bold uppercase tracking-wider block">
            Rejection Reason <span className="text-danger">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            className="w-full h-10 px-3 border border-border dark:border-gray-700 rounded-input bg-gray-55 dark:bg-gray-950 text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
          >
            <option value="">Select Reason</option>
            <option value="Invalid UTR">Invalid UTR</option>
            <option value="Incorrect Amount">Incorrect Amount</option>
            <option value="Screenshot Missing">Screenshot Missing</option>
            <option value="Duplicate Payment">Duplicate Payment</option>
            <option value="Wrong Payment">Wrong Payment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted font-bold uppercase tracking-wider block">
            Remarks {reason === "Other" && <span className="text-danger">*</span>}
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Provide comments for resident clarification..."
            rows={3}
            className="w-full p-3 border border-border dark:border-gray-700 rounded-input bg-gray-55 dark:bg-gray-950 text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
          />
        </div>

        {error && <p className="text-xxs text-danger font-bold uppercase tracking-wide">{error}</p>}

        <div className="flex gap-3 mt-6 pt-4 border-t border-border dark:border-gray-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 font-bold uppercase tracking-wider cursor-pointer"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-red-600 hover:bg-red-750 text-white font-bold uppercase tracking-wider cursor-pointer"
            isLoading={isLoading}
          >
            Confirm Reject
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface ClarificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; message: string }) => void;
  isLoading?: boolean;
}

export const ClarificationDialog: React.FC<ClarificationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a query reason.");
      return;
    }
    if (!message.trim()) {
      setError("Please write a detailed clarification message.");
      return;
    }
    setError("");
    onConfirm({ reason, message });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Payment Clarification">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted font-bold uppercase tracking-wider block">
            Clarification Reason <span className="text-danger">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            className="w-full h-10 px-3 border border-border dark:border-gray-700 rounded-input bg-gray-55 dark:bg-gray-950 text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
          >
            <option value="">Select Reason</option>
            <option value="Invalid UTR">Invalid UTR</option>
            <option value="Incorrect Amount">Incorrect Amount</option>
            <option value="Screenshot Missing">Screenshot Missing</option>
            <option value="Duplicate Payment">Duplicate Payment</option>
            <option value="Wrong Payment">Wrong Payment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted font-bold uppercase tracking-wider block">
            Message to Resident <span className="text-danger">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Instruct the resident on how to resolve this payment issue..."
            rows={4}
            className="w-full p-3 border border-border dark:border-gray-700 rounded-input bg-gray-55 dark:bg-gray-950 text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
          />
        </div>

        {error && <p className="text-xxs text-danger font-bold uppercase tracking-wide">{error}</p>}

        <div className="flex gap-3 mt-6 pt-4 border-t border-border dark:border-gray-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 font-bold uppercase tracking-wider cursor-pointer"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider cursor-pointer"
            isLoading={isLoading}
          >
            Request Clarification
          </Button>
        </div>
      </form>
    </Modal>
  );
};
