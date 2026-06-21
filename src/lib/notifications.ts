export interface NotificationItem {
  id: string;
  type: "meal_reminder" | "plan_ready" | "order_ready" | "nutrition_tips";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationSettings {
  meal_reminder: boolean;
  plan_ready: boolean;
  order_ready: boolean;
  nutrition_tips: boolean;
  [key: string]: boolean;
}


const DEFAULT_SETTINGS: NotificationSettings = {
  meal_reminder: true,
  plan_ready: true,
  order_ready: true,
  nutrition_tips: false,
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "mock_meal_1",
    type: "meal_reminder",
    title: "Pengingat Makan Siang",
    message: "Waktunya makan siang! Yuk nikmati menu sehatmu hari ini agar energimu tetap terjaga.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: "mock_plan_1",
    type: "plan_ready",
    title: "Meal Plan AI Siap!",
    message: "Rencana makan barumu telah berhasil dibuat oleh Groq AI sesuai budget dan profil nutrisimu.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    read: true,
  },
  {
    id: "mock_order_1",
    type: "order_ready",
    title: "Pesanan Siap Diambil",
    message: "Pesanan Salad Ayam Garing di Catering Sehat sudah siap! Tunjukkan barcode saat pengambilan.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: "mock_tips_1",
    type: "nutrition_tips",
    title: "Tips Nutrisi Harian",
    message: "Minum air putih minimal 2 liter sehari membantu mengoptimalkan metabolisme dan konsentrasi Anda.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
  },
];

// Helper to get settings safely
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem("notification_settings");
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Error reading notification settings", e);
  }
  return DEFAULT_SETTINGS;
}

// Helper to save settings safely
export function saveNotificationSettings(settings: NotificationSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("notification_settings", JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving notification settings", e);
  }
}

// Helper to get history safely
export function getNotificationHistory(): NotificationItem[] {
  if (typeof window === "undefined") return [];
  try {
    let saved = localStorage.getItem("notifications_history");
    if (!saved) {
      // Seed initial mock notifications if empty
      localStorage.setItem("notifications_history", JSON.stringify(MOCK_NOTIFICATIONS));
      return MOCK_NOTIFICATIONS;
    }
    return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading notification history", e);
  }
  return [];
}

// Helper to save history safely
export function saveNotificationHistory(history: NotificationItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("notifications_history", JSON.stringify(history));
  } catch (e) {
    console.error("Error saving notification history", e);
  }
}

// Add notification
export function addNotification(
  type: NotificationItem["type"],
  title: string,
  message: string,
  customId?: string
): boolean {
  if (typeof window === "undefined") return false;

  const settings = getNotificationSettings();
  if (!settings[type]) {
    // Notification category is disabled
    return false;
  }

  const history = getNotificationHistory();
  const id = customId || Math.random().toString(36).substring(2, 9);

  // Avoid duplicate custom IDs
  if (customId && history.some((item) => item.id === customId)) {
    return false;
  }

  const newNotif: NotificationItem = {
    id,
    type,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const updatedHistory = [newNotif, ...history];
  saveNotificationHistory(updatedHistory);

  // Dispatch custom event to notify components in real time
  window.dispatchEvent(new Event("notifications_updated"));

  // Play notification chime!
  playNotificationSound();

  return true;
}

// Mark single as read
export function markAsRead(id: string) {
  const history = getNotificationHistory();
  const updated = history.map((item) =>
    item.id === id ? { ...item, read: true } : item
  );
  saveNotificationHistory(updated);
  window.dispatchEvent(new Event("notifications_updated"));
}

// Mark all as read
export function markAllAsRead() {
  const history = getNotificationHistory();
  const updated = history.map((item) => ({ ...item, read: true }));
  saveNotificationHistory(updated);
  window.dispatchEvent(new Event("notifications_updated"));
}

// Delete notification
export function deleteNotification(id: string) {
  const history = getNotificationHistory();
  const updated = history.filter((item) => item.id !== id);
  saveNotificationHistory(updated);
  window.dispatchEvent(new Event("notifications_updated"));
}

// Clear all history
export function clearNotificationHistory() {
  saveNotificationHistory([]);
  window.dispatchEvent(new Event("notifications_updated"));
}

// Play a crystal-clear premium chime sound when a notification is triggered
export function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // High clear bell tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5 note
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.08); // Jump to A6
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Warm base chord tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(440, now); // A4 note
    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.warn("Chime audio failed to play:", e);
  }
}

