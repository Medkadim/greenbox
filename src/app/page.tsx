import Link from "next/link";
import { Leaf, Salad, Truck, CalendarCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Weekly menus",
    description:
      "Follow GreenBox's recommended menu or build your own from our healthy meal selection.",
  },
  {
    icon: Salad,
    title: "Personalized meals",
    description:
      "Tell us your allergies, preferences and per-meal requests — the kitchen sees it all.",
  },
  {
    icon: Truck,
    title: "Reliable delivery",
    description:
      "Track your delivery in real time, at the time that suits you.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Leaf className="text-primary size-5" />
            GreenBox
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Healthy meals, made for your week in Tangier.
            </h1>
            <p className="text-muted-foreground text-lg">
              Subscribe once, eat well all week. Choose the GreenBox
              recommended menu or build your own — we handle the cooking and
              the delivery.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">Start your subscription</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="text-primary mb-2 size-6" />
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="text-muted-foreground mx-auto max-w-6xl px-4 text-sm">
          GreenBox — Tangier, Morocco
        </div>
      </footer>
    </div>
  );
}
