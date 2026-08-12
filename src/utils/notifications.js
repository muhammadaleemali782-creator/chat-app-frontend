// Jab app background mein ho (user ne koi aur app khol li ho, ya home button dabaya ho)
// tab naya message/call aane par yeh system ke notification tray mein dikhta hai -
// jaisa normal Android apps karte hain. Jab app khud khuli/foreground mein ho, tab
// zaroorat nahi (in-app UI/sound already kaafi hai).

let isForeground = true;
export function setForeground(v) {
  isForeground = v;
}
export function isAppForeground() {
  return isForeground;
}

let notifId = 1000;

export async function requestNotificationPermission() {
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== "granted") {
      await LocalNotifications.requestPermissions();
    }
  } catch (err) {
    // Web browser mein (jaha yeh native plugin nahi hai) chup-chaap ignore karo
  }
}

export async function showLocalNotification(title, body, extra = {}) {
  // Sirf background mein dikhao - foreground mein already in-app sound/UI hai
  if (isForeground) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notifId++,
          title,
          body,
          extra,
        },
      ],
    });
  } catch (err) {
    // Web ya permission na hone par ignore
  }
}
