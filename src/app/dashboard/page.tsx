import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "business") {
    redirect("/auth/business/login");
  }

  const business = await prisma.business.findUnique({
    where: { id: session.user.id },
  });

  const deals = await prisma.deal.findMany({
    where: { businessId: session.user.id },
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardClient
      businessName={business?.name || session.user.name || ""}
      deals={JSON.parse(JSON.stringify(deals))}
    />
  );
}
