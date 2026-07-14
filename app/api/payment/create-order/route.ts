import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, amount } = body;

    if (!["BASIC", "PREMIUM"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if ((plan === "BASIC" && amount !== 99) || (plan === "PREMIUM" && amount !== 499)) {
       return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_xxxx",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "yyyy",
    });

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_plan_${Date.now()}`,
      notes: {
        userId: user.id,
        plan: plan,
      }
    };

    const order = await instance.orders.create(options);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
