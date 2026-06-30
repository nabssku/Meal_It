"use server";

import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@mealit.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function subscribeToPushAction(subscription: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // Save or update subscription in DB
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in subscribeToPushAction:", error);
    return { success: false, error: error.message || "Failed to register subscription" };
  }
}

export async function unsubscribeFromPushAction(endpoint: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in unsubscribeFromPushAction:", error);
    return { success: false, error: error.message || "Failed to remove subscription" };
  }
}

export async function sendPushNotificationAction(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return { success: false, error: "No active push subscriptions found for this user" };
    }

    let successCount = 0;
    let failCount = 0;

    const payloadString = JSON.stringify(payload);

    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payloadString);
        successCount++;
      } catch (err: any) {
        console.error("Failed to send push notification to endpoint:", sub.endpoint, err);
        // Delete expired/invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
        failCount++;
      }
    }

    return { success: true, successCount, failCount };
  } catch (error: any) {
    console.error("Error in sendPushNotificationAction:", error);
    return { success: false, error: error.message || "Failed to send notifications" };
  }
}

export async function broadcastPushNotificationAction(
  payload: { title: string; body: string; url?: string }
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return { success: false, error: "No active subscriptions in the database" };
    }

    let successCount = 0;
    let failCount = 0;

    const payloadString = JSON.stringify(payload);

    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payloadString);
        successCount++;
      } catch (err: any) {
        console.error("Failed to broadcast push notification to endpoint:", sub.endpoint, err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
        failCount++;
      }
    }

    return { success: true, successCount, failCount };
  } catch (error: any) {
    console.error("Error in broadcastPushNotificationAction:", error);
    return { success: false, error: error.message || "Failed to broadcast notifications" };
  }
}

export async function getActiveSubscribersCountAction() {
  try {
    const total = await prisma.pushSubscription.count();
    const uniqueUsers = await prisma.pushSubscription.groupBy({
      by: ["userId"],
    });
    return { success: true, total, uniqueUsers: uniqueUsers.length };
  } catch (error: any) {
    console.error("Error in getActiveSubscribersCountAction:", error);
    return { success: false, total: 0, uniqueUsers: 0 };
  }
}
