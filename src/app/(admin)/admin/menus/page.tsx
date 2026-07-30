import Link from "next/link";
import { CalendarDays } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listWeeklyMenus } from "@/lib/data/weekly-menu";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  DRAFT: "outline",
  PUBLISHED: "default",
  LOCKED: "secondary",
};

export default async function AdminWeeklyMenusPage() {
  const menus = await listWeeklyMenus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Weekly menus</h1>
          <p className="text-muted-foreground text-sm">
            Create, publish and lock each week&apos;s menu.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/menus/new">New weekly menu</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All menus ({menus.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {menus.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No weekly menus yet"
              description="Create one to start planning meals for customers."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Meals set</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell>
                      <Link
                        href={`/admin/menus/${menu.id}`}
                        className="font-medium hover:underline"
                      >
                        {menu.weekStartDate.toLocaleDateString()} –{" "}
                        {menu.weekEndDate.toLocaleDateString()}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[menu.status]}>
                        {menu.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {menu.selectionDeadline.toLocaleString()}
                    </TableCell>
                    <TableCell>{menu.menuItems.length} / 14</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
