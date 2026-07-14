import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "yyyy";
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Payment is valid, update user plan in prisma
    // We assume Prisma User ID is the same as Supabase user ID, which is typical for this stack.
    // If Prisma is disconnected, we do upsert based on email or id.
    const dbUser = await prisma.user.findFirst({
      where: { id: user.id }
    });

    if (!dbUser) {
      // Create user if not exists (in case it wasn't synced via webhook yet)
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || "New User",
          plan: plan,
        }
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: plan }
      });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
