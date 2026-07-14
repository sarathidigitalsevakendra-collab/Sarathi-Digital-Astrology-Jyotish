import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

function generateReferralCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(_req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let dbUser = await prisma.user.findFirst({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!dbUser.referralCode) {
      let code = generateReferralCode();
      let exists = await prisma.user.findFirst({ where: { referralCode: code } });
      while (exists) {
        code = generateReferralCode();
        exists = await prisma.user.findFirst({ where: { referralCode: code } });
      }

      dbUser = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: code }
      });
    }

    return NextResponse.json({ referralCode: dbUser.referralCode });
  } catch (error) {
    console.error("Failed to get/generate referral code:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
