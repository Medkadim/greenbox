import { AlertTriangle, Clock, MessageSquare, Tag, ThumbsDown, ThumbsUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderTicket as OrderTicketData } from "@/lib/data/kitchen";

const TAG_LABEL_AR: Record<string, string> = {
  NEW_CUSTOMER: "عميل جديد",
  VIP: "كبار الشخصيات",
  ALLERGY_ALERT: "تنبيه حساسية",
  VEGETARIAN: "نباتي",
  VEGAN: "نباتي صرف",
  HIGH_PROTEIN: "غني بالبروتين",
  WEIGHT_LOSS: "إنقاص الوزن",
};

export function OrderTicketAr({ ticket }: { ticket: OrderTicketData }) {
  const hasAllergyAlert = ticket.allergies.length > 0 || Boolean(ticket.otherAllergies);
  const hasTime = ticket.deliveryTimeStart || ticket.deliveryTimeEnd;

  return (
    <Card className={hasAllergyAlert ? "border-destructive" : undefined}>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="text-muted-foreground size-4" />
            {hasTime
              ? `${ticket.deliveryTimeStart ?? "—"} – ${ticket.deliveryTimeEnd ?? "—"}`
              : "بدون وقت محدد"}
          </div>
          {hasAllergyAlert && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="size-3" />
              حساسية
            </Badge>
          )}
        </div>

        <div>
          <p className="font-medium">{ticket.customerName}</p>
          <p className="text-muted-foreground text-sm">{ticket.mealName}</p>
        </div>

        {ticket.allergies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <AlertTriangle className="text-destructive size-4 shrink-0" />
            {ticket.allergies.map((allergy) => (
              <Badge key={allergy.name} variant="destructive" className="text-xs">
                {allergy.name}
                {allergy.notes ? ` — ${allergy.notes}` : ""}
              </Badge>
            ))}
          </div>
        )}

        {ticket.otherAllergies && (
          <div className="flex flex-wrap items-center gap-1">
            <AlertTriangle className="text-destructive size-4 shrink-0" />
            <Badge variant="destructive" className="text-xs">
              {ticket.otherAllergies}
            </Badge>
          </div>
        )}

        {ticket.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <Tag className="text-muted-foreground size-4 shrink-0" />
            {ticket.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {TAG_LABEL_AR[tag] ?? tag}
              </Badge>
            ))}
          </div>
        )}

        {ticket.preferences.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {ticket.preferences.map((pref, i) => {
              const isPositive = pref.type === "LIKE";
              const Icon = isPositive ? ThumbsUp : ThumbsDown;
              return (
                <span key={i} className="inline-flex items-center gap-1">
                  <Icon
                    className={
                      isPositive
                        ? "size-4 shrink-0 text-green-600"
                        : "text-destructive size-4 shrink-0"
                    }
                  />
                  <Badge variant="secondary" className="text-xs">
                    {pref.label}
                  </Badge>
                </span>
              );
            })}
          </div>
        )}

        {ticket.note && (
          <div className="flex flex-wrap items-center gap-1">
            <MessageSquare className="text-muted-foreground size-4 shrink-0" />
            <Badge variant="secondary" className="text-xs">
              {ticket.note}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
