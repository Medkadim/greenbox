import Link from "next/link";
import { ChefHat, Leaf, ClipboardList, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Customer records",
    description:
      "The admin enters each customer's weekly meal plan, delivery window, allergies and remarks.",
  },
  {
    icon: ChefHat,
    title: "Kitchen production",
    description:
      "The kitchen sees exactly what to prepare each day, with every customer's allergies and remarks.",
  },
  {
    icon: Truck,
    title: "Delivery tracking",
    description: "Assign each delivery to a driver and track it through to done.",
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
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              GreenBox operations, Tangier.
            </h1>
            <p className="text-muted-foreground text-lg">
              Internal console for the GreenBox team — admin, kitchen and
              delivery. Customer accounts are managed entirely by the admin.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">Sign in</Link>
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
