"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateCustomerAllergies } from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Allergy = { id: string; name: string };
type ExistingAllergy = { allergyId: string; notes: string | null };

export function AllergiesForm({
  allergies,
  existing,
}: {
  allergies: Allergy[];
  existing: ExistingAllergy[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initial = Object.fromEntries(
    allergies.map((allergy) => {
      const match = existing.find((e) => e.allergyId === allergy.id);
      return [
        allergy.id,
        { checked: Boolean(match), notes: match?.notes ?? "" },
      ];
    })
  );

  const [state, setState] = useState<
    Record<string, { checked: boolean; notes: string }>
  >(initial);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      try {
        await updateCustomerAllergies({
          allergies: allergies.map((allergy) => ({
            allergyId: allergy.id,
            checked: state[allergy.id]?.checked ?? false,
            notes: state[allergy.id]?.notes ?? "",
          })),
        });
        toast.success("Allergies updated.");
        router.refresh();
      } catch {
        toast.error("Could not update allergies.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {allergies.map((allergy) => (
        <div key={allergy.id} className="flex items-start gap-3">
          <Checkbox
            id={`allergy-${allergy.id}`}
            checked={state[allergy.id]?.checked ?? false}
            onCheckedChange={(checked) =>
              setState((prev) => ({
                ...prev,
                [allergy.id]: {
                  checked: checked === true,
                  notes: prev[allergy.id]?.notes ?? "",
                },
              }))
            }
            className="mt-1"
          />
          <div className="flex-1 space-y-1">
            <Label htmlFor={`allergy-${allergy.id}`}>{allergy.name}</Label>
            {state[allergy.id]?.checked && (
              <Input
                placeholder="Notes (optional)"
                value={state[allergy.id]?.notes ?? ""}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    [allergy.id]: {
                      checked: true,
                      notes: event.target.value,
                    },
                  }))
                }
              />
            )}
          </div>
        </div>
      ))}
      <Button type="submit" disabled={isPending} size="sm">
        Save allergies
      </Button>
    </form>
  );
}
