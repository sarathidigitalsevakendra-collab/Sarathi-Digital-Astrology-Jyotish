import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/monitoring/logger";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return null;
    }
    return user;
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kundlis = await prisma.kundli.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ kundlis });
  } catch (error) {
    logger.error("DB Error in GET /api/user/kundli:", error);
    return NextResponse.json(
        { error: "Failed to fetch charts" }, 
        { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
        name, 
        birthDate, 
        birthTime, 
        birthPlace, 
        latitude, 
        longitude, 
        timezone, 
        chartData 
    } = body;
    
    // Validate required fields
    if (!name || !birthDate || !birthTime || !birthPlace) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    // Ensure user exists in Prisma (sync user from Auth)
    // In a real app, this might happen via webhooks, but we'll do a lazy check here for safety
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
        // Fallback: This should ideally be handled by onboarding, but preventing crash here
        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || "User",
            }
        });
    }

    const kundli = await prisma.kundli.create({
      data: {
        userId: user.id,
        name,
        birthDate: new Date(birthDate),
        birthTime,
        birthPlace,
        latitude,
        longitude,
        timezone: timezone?.toString() || "0",
        chartData: chartData || {},
      },
    });

    return NextResponse.json({ kundli });
  } catch (error) {
    logger.error("Failed to save chart", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save chart" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, isFavorite } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing chart ID" }, { status: 400 });
        }

        // Verify ownership
        const existing = await prisma.kundli.findUnique({ where: { id } });
        if (!existing || existing.userId !== user.id) {
            return NextResponse.json({ error: "Chart not found" }, { status: 404 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

        const updated = await prisma.kundli.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ kundli: updated });

    } catch (error) {
        logger.error("Failed to update chart", error);
        return NextResponse.json(
            { error: "Failed to update chart" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        
        if (!id) {
            return NextResponse.json(
                { error: "Missing chart ID" },
                { status: 400 }
            );
        }

        // Verify ownership
        const existing = await prisma.kundli.findUnique({ where: { id } });
        if (!existing || existing.userId !== user.id) {
             return NextResponse.json({ error: "Chart not found" }, { status: 404 });
        }

        await prisma.kundli.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Failed to delete chart", error);
        return NextResponse.json(
            { error: "Failed to delete chart" },
            { status: 500 }
        );
    }
}
