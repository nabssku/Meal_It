"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { subscribeToPushAction } from "@/app/actions/push-actions";
import { useSession } from "next-auth/react";

interface PwaContextProps {
  isInstallable: boolean;
  isInstalled: boolean;
  installApp: () => Promise<void>;
  isSubscribed: boolean;
  permissionStatus: NotificationPermission | "unsupported";
  requestNotificationPermission: () => Promise<boolean>;
  locationPermission: PermissionState | "unsupported";
  requestLocationPermission: () => Promise<GeolocationPosition | null>;
}

const PwaContext = createContext<PwaContextProps | null>(null);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default");
  const [locationPermission, setLocationPermission] = useState<PermissionState | "unsupported">("prompt");

  // 1. Detect PWA Installability and installation state
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if app is already running in standalone mode (installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 2. Load initial permission statuses
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setPermissionStatus("unsupported");
    } else {
      setPermissionStatus(Notification.permission);
    }

    // Check location permission state
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setLocationPermission(result.state);
          result.onchange = () => {
            setLocationPermission(result.state);
          };
        })
        .catch(() => {
          setLocationPermission("unsupported");
        });
    } else {
      setLocationPermission("unsupported");
    }
  }, []);

  // 3. Auto-subscribe logic when user is logged in and notification permission is granted
  useEffect(() => {
    const checkAndSyncSubscription = async () => {
      if (typeof window === "undefined" || !userId) return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      if (Notification.permission !== "granted") {
        setIsSubscribed(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Sync with database
          const keys = subscription.toJSON().keys;
          if (keys?.p256dh && keys?.auth) {
            await subscribeToPushAction({
              endpoint: subscription.endpoint,
              keys: {
                p256dh: keys.p256dh,
                auth: keys.auth,
              },
            });
            setIsSubscribed(true);
          }
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error("Error checking push subscription:", error);
      }
    };

    checkAndSyncSubscription();
  }, [userId, permissionStatus]);

  // Trigger PWA Installation
  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Helper to convert base64 VAPID key to UInt8Array for browser push manager
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Request Notification permission & Subscribe
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);

    if (permission !== "granted") return false;

    // Subscribe to push notifications
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) {
          console.error("VAPID public key not found in environment variables");
          return true;
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        const keys = subscription.toJSON().keys;
        if (keys?.p256dh && keys?.auth) {
          const result = await subscribeToPushAction({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: keys.p256dh,
              auth: keys.auth,
            },
          });
          if (result.success) {
            setIsSubscribed(true);
            return true;
          }
        }
      } catch (error) {
        console.error("Failed to subscribe browser to Web Push:", error);
      }
    }

    return true;
  };

  // Request Geolocation permission
  const requestLocationPermission = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission("granted");
          resolve(position);
        },
        (error) => {
          console.warn("Geolocation permission error:", error);
          setLocationPermission("denied");
          resolve(null);
        }
      );
    });
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        installApp,
        isSubscribed,
        permissionStatus,
        requestNotificationPermission,
        locationPermission,
        requestLocationPermission,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa must be used within a PwaProvider");
  }
  return context;
}
