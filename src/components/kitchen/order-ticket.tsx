import { AlertTriangle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderTicket as OrderTicketData } from "@/lib/data/kitchen";

const PREFERENCE_LABEL: Record<string, string> = {
  LIKE: "Likes",
  DISLIKE: "Dislikes",
  AVOID: "Avoid",
};

export function OrderTicket({ ticket }: { ticket: OrderTicketData }) {
  const hasAllergyAlert = ticket.allergies.length > 0 || Boolean(ticket.otherAllergies);
  const hasTime = ticket.deliveryTimeStart || ticket.deliveryTimeEnd;

  return (
    <Card className={hasAllergyAlert ? "border-destructive" : undefined}>
      <CardContent className="space-y-2 pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="text-muted-foreground size-4" />
            {hasTime
              ? `${ticket.deliveryTimeStart ?? "—"} – ${ticket.deliveryTimeEnd ?? "—"}`
              : "No time set"}
          </div>
          {hasAllergyAlert && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="size-3" />
              Allergy
            </Badge>
          )}
        </div>

        <div>
          <p className="font-medium">{ticket.customerName}</p>
          <p className="text-muted-foreground text-sm">{ticket.mealName}</p>
        </div>

        {(ticket.allergies.length > 0 ||
          ticket.otherAllergies ||
          ticket.preferences.length > 0 ||
          ticket.tags.length > 0 ||
          ticket.note) && (
          <div className="flex flex-wrap gap-1 pt-1">
            {ticket.allergies.map((allergy) => (
              <Badge key={allergy.name} variant="destructive" className="text-xs">
                {allergy.name}
                {allergy.notes ? ` — ${allergy.notes}` : ""}
              </Badge>
            ))}
            {ticket.otherAllergies && (
              <Badge variant="destructive" className="text-xs">
                {ticket.otherAllergies}
              </Badge>
            )}
            {ticket.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag.replaceAll("_", " ").toLowerCase()}
              </Badge>
            ))}
            {ticket.preferences.map((pref, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {PREFERENCE_LABEL[pref.type] ?? pref.type}: {pref.label}
              </Badge>
            ))}
            {ticket.note && (
              <Badge variant="secondary" className="text-xs">
                {ticket.note}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
