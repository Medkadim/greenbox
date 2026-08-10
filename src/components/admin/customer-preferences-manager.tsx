"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  adminAddCustomerPreference,
  adminDeleteCustomerPreference,
} from "@/lib/actions/customer";
import {
  customerPreferenceSchema,
  type CustomerPreferenceInput,
} from "@/lib/validations/customer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Preference = { id: string; type: "LIKE" | "DISLIKE" | "AVOID"; label: string };

const TYPE_LABEL: Record<Preference["type"], string> = {
  LIKE: "Likes",
  DISLIKE: "Dislikes",
  AVOID: "Avoids",
};

export function CustomerPreferencesManager({
  customerProfileId,
  preferences,
}: {
  customerProfileId: string;
  preferences: Preference[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<CustomerPreferenceInput>({
    resolver: zodResolver(customerPreferenceSchema),
    defaultValues: { type: "LIKE", label: "" },
  });

  function onSubmit(values: CustomerPreferenceInput) {
    startTransition(async () => {
      try {
        const result = await adminAddCustomerPreference(customerProfileId, values);
        if (result?.error) {
          toast.error(result.error);
          return;
        }
        form.reset({ type: values.type, label: "" });
        toast.success("Preference added.");
        router.refresh();
      } catch {
        toast.error("Could not add preference.");
      }
    });
  }

  function onDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await adminDeleteCustomerPreference(customerProfileId, id);
        router.refresh();
      } catch {
        toast.error("Could not remove preference.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {preferences.length === 0 && (
          <p className="text-muted-foreground text-sm">No preferences yet.</p>
        )}
        {preferences.map((preference) => (
          <Badge key={preference.id} variant="secondary" className="gap-1.5">
            {TYPE_LABEL[preference.type]}: {preference.label}
            <button
              type="button"
              onClick={() => onDelete(preference.id)}
              disabled={isPending && deletingId === preference.id}
              aria-label={`Remove ${preference.label}`}
            >
              <Trash2 className="size-3" />
            </button>
          </Badge>
        ))}
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <Select
          value={form.watch("type")}
          onValueChange={(value) =>
            form.setValue("type", value as CustomerPreferenceInput["type"])
          }
        >
          <SelectTrigger className="sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LIKE">Likes</SelectItem>
            <SelectItem value="DISLIKE">Dislikes</SelectItem>
            <SelectItem value="AVOID">Avoids</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="e.g. spicy food, onions, vegetables"
          {...form.register("label")}
        />
        <Button type="submit" disabled={isPending}>
          Add
        </Button>
      </form>
      {form.formState.errors.label && (
        <p className="text-destructive text-sm">
          {form.formState.errors.label.message}
        </p>
      )}
    </div>
  );
}
