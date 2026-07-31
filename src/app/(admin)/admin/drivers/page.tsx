import { Truck } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DriverForm } from "@/components/admin/driver-form";
import { DriverActiveToggle } from "@/components/admin/driver-active-toggle";
import { listDrivers } from "@/lib/data/driver";

export default async function AdminDriversPage() {
  const drivers = await listDrivers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Delivery team</h1>
        <p className="text-muted-foreground text-sm">
          Add drivers and manage who&apos;s currently active.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a driver</CardTitle>
        </CardHeader>
        <CardContent>
          <DriverForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All drivers ({drivers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <EmptyState icon={Truck} title="No drivers yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">
                      {driver.user.name}
                    </TableCell>
                    <TableCell>{driver.user.phoneNumber}</TableCell>
                    <TableCell>{driver.vehicleInfo ?? "—"}</TableCell>
                    <TableCell>
                      <DriverActiveToggle
                        driverId={driver.id}
                        isActive={driver.isActive}
                      />
                    </TableCell>
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
