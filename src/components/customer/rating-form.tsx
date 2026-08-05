"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { submitRating } from "@/lib/actions/rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function RatingForm({
  customerMealSelectionId,
}: {
  customerMealSelectionId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState("");

  function onSubmit() {
    if (score < 1) {
      toast.error("Pick a star rating first.");
      return;
    }
    startTransition(async () => {
      const result = await submitRating({
        customerMealSelectionId,
        score,
        comment: comment.trim() || undefined,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Thanks for your feedback!");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1" role="radiogroup" aria-label="Meal rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            aria-checked={score === value}
            role="radio"
            disabled={isPending}
            onClick={() => setScore(value)}
            onMouseEnter={() => setHoverScore(value)}
            onMouseLeave={() => setHoverScore(0)}
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                (hoverScore || score) >= value
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Any comments? (optional)"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={2}
      />
      <Button type="button" size="sm" disabled={isPending} onClick={onSubmit}>
        Submit rating
      </Button>
    </div>
  );
}
