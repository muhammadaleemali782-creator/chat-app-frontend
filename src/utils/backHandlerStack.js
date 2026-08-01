import { useEffect } from "react";

// Phone ke back button ko sahi se handle karne ke liye - jo bhi screen/modal is waqt
// "top pe" khula hai (call overlay, meeting modal, profile, ya chat khuli hui), wahi
// back button dabane par react karega (band ho jaayega / list pe wapas jaayega),
// pura app kabhi seedha exit/cut nahi hoga jab tak hum home screen pe na hon.

const handlers = new Map();
let order = [];

export function registerBackHandler(id, handler) {
  handlers.set(id, handler);
  order = order.filter((x) => x !== id);
  order.push(id);
}

export function unregisterBackHandler(id) {
  handlers.delete(id);
  order = order.filter((x) => x !== id);
}

// true return karta hai agar kisi ne back press handle kar liya (aage default action mat lo)
export function handleBackPress() {
  for (let i = order.length - 1; i >= 0; i--) {
    const handler = handlers.get(order[i]);
    if (handler) {
      const handled = handler();
      if (handled) return true;
    }
  }
  return false;
}

// Component ke andar use karne ke liye chhota hook
export function useBackHandler(id, active, handler) {
  useEffect(() => {
    if (active) {
      registerBackHandler(id, handler);
    } else {
      unregisterBackHandler(id);
    }
    return () => unregisterBackHandler(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, handler]);
}
