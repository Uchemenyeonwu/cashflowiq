"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";
import AddTransactionModal from "./add-transaction-modal";
import EditTransactionModal from "./edit-transaction-modal";
import { useRouter } from "next/navigation";

function AddButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Transaction
      </Button>
      <AddTransactionModal open={open} onOpenChange={setOpen} />
    </>
  );
}

function EditButton({ transaction }: { transaction: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-blue-600 hover:text-blue-800 mr-3"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <EditTransactionModal
        transaction={transaction}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

function DeleteButton({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;
    setDeleting(true);

    try {
      const res = await fetch("/api/transactions/" + transactionId, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Transaction deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:text-red-800"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export { AddButton, EditButton, DeleteButton };
