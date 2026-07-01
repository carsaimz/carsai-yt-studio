/**
 * Runtime app version hook.
 * - Native (Android/iOS via Capacitor): reads the real installed version from the App plugin.
 * - Web: uses the build-time APP_VERSION constant (always current — no install concept).
 */
import { useEffect, useState } from "react";
import { APP_VERSION } from "./version";

export function useAppVersion(): { version: string; build: string | null; loading: boolean } {
  const [version, setVersion] = useState(APP_VERSION);
  const [build, setBuild] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isNative =
      typeof window !== "undefined" &&
      !!(window as any).Capacitor?.isNativePlatform?.();

    if (!isNative) {
      setLoading(false);
      return;
    }

    import("@capacitor/app")
      .then(({ App }) => App.getInfo())
      .then((info) => {
        setVersion(info.version);
        setBuild(info.build);
      })
      .catch(() => {
        // Fallback to build-time constant if native plugin unavailable
      })
      .finally(() => setLoading(false));
  }, []);

  return { version, build, loading };
}
