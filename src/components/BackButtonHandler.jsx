import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { handleBackPress } from "../utils/backHandlerStack";

// App ke andar Android ka physical/gesture back button sunta hai. Pehle check karta hai
// ki koi modal/overlay/sub-screen khula hai kya (call, meeting popup, chat khuli hui) -
// agar haan, usko band karta hai. Agar nahi (matlab hum home/root screen pe hain), to
// app ko exit/cut nahi karta - bas minimize (background me) bhej deta hai, jaisa
// WhatsApp/Instagram jaise apps karte hain.
export default function BackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let listenerHandle;
    let cancelled = false;

    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const sub = await App.addListener("backButton", () => {
          // Step 1: kisi khule modal/sub-screen ne handle kar liya?
          const handled = handleBackPress();
          if (handled) return;

          // Step 2: agar hum login/register/forgot-password jaise kisi sub-page pe
          // hain (root "/" nahi), to app ke andar hi peeche jao
          if (location && location.pathname !== "/") {
            navigate(-1);
            return;
          }

          // Step 3: hum home/root pe hain - app ko cut mat karo, bas minimize karo
          App.minimizeApp().catch(() => {});
        });
        if (!cancelled) listenerHandle = sub;
      } catch (err) {
        // Capacitor App plugin available nahi hai (jaise normal browser mein dev
        // karte waqt) - is case mein kuch mat karo, browser ka normal back kaam karega
      }
    })();

    return () => {
      cancelled = true;
      if (listenerHandle) listenerHandle.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
}
