import { useEffect, useState } from "react";

/**
 * Returns `true` only after `delay` ms of *continuous* loading state.
 *
 * **Purpose:** Prevent skeleton flicker on fast re-fetches. When the user
 * changes location (or duration) the component briefly enters a loading state
 * while re-computing. Without this hook, the skeleton would flash in and out
 * in under a frame. By waiting `delay` ms before converting `loading=true`
 * into `show=true`, instant transitions remain invisible while genuine waits
 * (e.g. a network request) still show a skeleton.
 *
 * **Reset:** As soon as `loading` becomes `false` the hook returns `false`
 * immediately (no trailing delay) so content appears without extra latency.
 *
 * Usage pattern:
 * ```ts
 * const showSkeleton = useDelayedLoading(loading) && data === null;
 * ```
 *
 * @param loading  Current loading boolean from parent state
 * @param delay    How many ms to wait before showing the skeleton (default 300)
 * @returns  Whether the skeleton should currently be visible
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
