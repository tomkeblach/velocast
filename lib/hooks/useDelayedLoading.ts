import { useEffect, useState } from "react";

/**
 * Returns true only after `delay` ms of continuous loading.
 * Prevents skeleton flicker for fast re-computations.
 */
export function useDelayedLoading(loading: boolean, delay = 300): boolean {
  const [show, setShow] = useState(loading);

  useEffect(() => {
    if (!loading) {
      setShow(false);
      return;
    }
    const id = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(id);
  }, [loading, delay]);

  return show;
}
