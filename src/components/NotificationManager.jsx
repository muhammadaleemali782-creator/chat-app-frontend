import { useEffect } from "react";
import { setForeground, requestNotificationPermission } from "../utils/notifications";

// App khulte hi notification permission maangta hai, aur track karta rehta hai ki
// app abhi foreground mein hai ya background mein (taaki background mein hi
// notification dikhayein, foreground mein sirf in-app sound kaafi hai).
export default function NotificationManager() {
  useEffect(() => {
    requestNotificationPermission();

    let listenerHandle;
    let cancelled = false;

    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const sub = await App.addListener("appStateChange", ({ isActive }) => {
          setForeground(isActive);
        });
        if (!cancelled) listenerHandle = sub;
      } catch (err) {
        // Web browser mein Capacitor App plugin nahi hai - visibility API se kaam chalao
        const handler = () => setForeground(document.visibilityState === "visible");
        document.addEventListener("visibilitychange", handler);
        listenerHandle = { remove: () => document.removeEventListener("visibilitychange", handler) };
      }
    })();

    return () => {
      cancelled = true;
      if (listenerHandle) listenerHandle.remove();
    };
  }, []);

  return null;
}
