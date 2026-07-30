"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { addMealRequest, deleteMealRequest } from "@/lib/actions/menu-selection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Request = { id: string; note: string };

export function MealRequestManager({
  customerMealSelectionId,
  requests,
  disabled,
}: {
  customerMealSelectionId: string;
  requests: Request[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  function onAdd() {
    if (!note.trim()) return;
    startTransition(async () => {
      try {
        await addMealRequest({ customerMealSelectionId, note });
        setNote("");
        router.refresh();
      } catch {
        toast.error("Could not add the request.");
      }
    });
  }

  function onRemove(id: string) {
    startTransition(async () => {
      try {
        await deleteMealRequest(id);
        router.refresh();
      } catch {
        toast.error("Could not remove the request.");
      }
    });
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-1">
        {requests.map((request) => (
          <Badge key={request.id} variant="secondary" className="gap-1">
            {request.note}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(request.id)}
                aria-label={`Remove ${request.note}`}
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-1">
          <Input
            placeholder="e.g. no onions, more salt"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="h-8 text-xs"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={onAdd}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
