import { useEffect, useRef } from "react";

export function useDebouncedEffect(effect: () => void, deps: unknown[], delayMs = 300) {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    const id = setTimeout(() => effectRef.current(), delayMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
