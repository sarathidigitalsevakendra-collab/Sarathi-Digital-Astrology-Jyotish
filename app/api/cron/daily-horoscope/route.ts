import { NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/db/prisma";


export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(
        "mailto:contact@jyotisya.app",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } catch (e) {
      console.warn("Failed to set VAPID details:", e);
    }
  }

  // Protect this route in production (e.g., check a secret header from Vercel Cron)
  if (
    process.env.NODE_ENV === "production" &&
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      include: { user: true }
    });

    const notifications = subscriptions.map(async (sub) => {
      const payload = JSON.stringify({
        title: "Your Daily Horoscope 🌟",
        body: `Namaste ${sub.user.name.split(" ")[0]}, your daily panchang and horoscope are ready. Check what the stars say today!`,
        url: "/dashboard/annual-horoscope"
      });

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh
            }
          },
          payload
        );
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription has expired or is no longer valid, delete it
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Error sending push to", sub.endpoint, error);
        }
      }
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
