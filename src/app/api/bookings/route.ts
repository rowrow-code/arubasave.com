import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { dealId, guestName, guestPhone } = await req.json();

    if (!dealId || !guestName || !guestPhone) {
      return NextResponse.json(
        { error: "Deal ID, name, and phone are required" },
        { status: 400 }
      );
    }

    // Use a transaction to atomically check slots and create booking
    const booking = await prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findUnique({
        where: { id: dealId },
        select: { id: true, totalSlots: true, expiryDate: true, title: true },
      });

      if (!deal) {
        throw new Error("DEAL_NOT_FOUND");
      }

      if (deal.expiryDate < new Date()) {
        throw new Error("DEAL_EXPIRED");
      }

      const bookingCount = await tx.booking.count({
        where: { dealId },
      });

      if (bookingCount >= deal.totalSlots) {
        throw new Error("NO_SLOTS");
      }

      return tx.booking.create({
        data: { dealId, guestName: guestName.trim(), guestPhone: guestPhone.trim() },
      });
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";

    if (message === "DEAL_NOT_FOUND") {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }
    if (message === "DEAL_EXPIRED") {
      return NextResponse.json(
        { error: "This deal has expired" },
        { status: 410 }
      );
    }
    if (message === "NO_SLOTS") {
      return NextResponse.json(
        { error: "No slots available for this deal" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
