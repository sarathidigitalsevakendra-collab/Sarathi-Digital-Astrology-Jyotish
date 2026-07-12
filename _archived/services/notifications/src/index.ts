import webpush from "web-push";

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

export class PushService {
  constructor() {
    webpush.setVapidDetails(
      "mailto:support@jyotishya.in",
      process.env.VAPID_PUBLIC_KEY ?? "public-key",
      process.env.VAPID_PRIVATE_KEY ?? "private-key",
    );
  }

  async send(subscription: webpush.PushSubscription, payload: NotificationPayload) {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  }
}
