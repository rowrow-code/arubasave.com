import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        business: { select: { id: true, name: true, phone: true } },
        _count: { select: { bookings: true } },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.expiryDate < new Date()) {
      return NextResponse.json({ error: "Deal has expired" }, { status: 410 });
    }

    return NextResponse.json(deal);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "business") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deal = await prisma.deal.findUnique({ where: { id: params.id } });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.businessId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete associated image file if it exists
    if (deal.imageUrl) {
      const filePath = path.join(process.cwd(), "public", deal.imageUrl);
      try {
        await unlink(filePath);
      } catch {
        // File may not exist, ignore error
      }
    }

    await prisma.deal.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
