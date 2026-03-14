export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Category } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  try {
    const deals = await prisma.deal.findMany({
      where: {
        expiryDate: { gt: new Date() },
        ...(category && Object.values(Category).includes(category as Category)
          ? { category: category as Category }
          : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                {
                  business: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        business: { select: { id: true, name: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deals);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "business") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      description,
      category,
      originalPrice,
      discountedPrice,
      expiryDate,
      totalSlots,
      imageUrl,
    } = await req.json();

    if (
      !title ||
      !description ||
      !category ||
      !originalPrice ||
      !discountedPrice ||
      !expiryDate ||
      !totalSlots
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!Object.values(Category).includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (Number(discountedPrice) >= Number(originalPrice)) {
      return NextResponse.json(
        { error: "Discounted price must be less than original price" },
        { status: 400 }
      );
    }

    if (new Date(expiryDate) <= new Date()) {
      return NextResponse.json(
        { error: "Expiry date must be in the future" },
        { status: 400 }
      );
    }

    const deal = await prisma.deal.create({
      data: {
        businessId: session.user.id,
        title,
        description,
        category,
        originalPrice: Number(originalPrice),
        discountedPrice: Number(discountedPrice),
        expiryDate: new Date(expiryDate),
        totalSlots: Number(totalSlots),
        imageUrl: imageUrl || null,
      },
      include: {
        business: { select: { id: true, name: true } },
        _count: { select: { bookings: true } },
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 }
    );
  }
}
