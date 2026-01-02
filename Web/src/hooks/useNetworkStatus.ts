import { useEffect, useState } from "react";

export function useNetworkStatus() {
  // const [online, setOnline] = useState<boolean>(true);
  const [online, setOnline] = useState<boolean | null>(null);


  useEffect(() => {
    let interval: NodeJS.Timeout;

    const check = async () => {
      try {
        // Electron path
        if (window.posAPI && typeof window.posAPI.isOnline === "function") {
          const status = await window.posAPI.isOnline();
          setOnline(status);
          return;
        }

        // Web fallback
        // const webStatus = navigator.onLine;
        const webStatus = await fetch("https://www.google.com", { method: "HEAD" })
        console.log("Web network:", webStatus);
        setOnline(webStatus?.ok as boolean);
      } catch (err) {
        console.error(" Network check failed", err);
        setOnline(false); // FAIL SAFE
      }
    };

    check();
    interval = setInterval(check, 5000);

    return () => clearInterval(interval);
  }, []);

  return online;
}
