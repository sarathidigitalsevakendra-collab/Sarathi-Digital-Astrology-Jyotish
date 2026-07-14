import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code;

  // We could also do a Prisma check here to ensure the code is valid,
  // but just setting it in a cookie is faster, and it can be validated on sign up.
  const response = NextResponse.redirect(new URL("/", req.url));
  
  // Set referral code cookie that expires in 30 days
  response.cookies.set({
    name: "referredBy",
    value: code,
    path: "/",
    maxAge: 30 * 24 * 60 * 60, 
  });

  return response;
}
