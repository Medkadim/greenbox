import { db } from "@/lib/db";

export async function getFinanceOverview() {
  const [revenueAgg, paidCount, recentPayments] = await Promise.all([
    db.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    db.payment.count({ where: { status: "PAID" } }),
    db.payment.findMany({
      include: {
        subscription: {
          include: {
            plan: true,
            customerProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    totalRevenue: Number(revenueAgg._sum.amount ?? 0),
    paidCount,
    recentPayments,
  };
}
