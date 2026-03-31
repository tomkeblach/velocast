"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

/**
 * Renders a number that spring-animates to its target value.
 *
 * **Animation model:**
 * `useMotionValue` holds the raw value; `useSpring` drives it toward the
 * target with physical spring parameters (stiffness 60, damping 18 —
 * intentionally bouncy for a score "counting up" feel); `useTransform`
 * converts the continuous float to a rounded integer string for display.
 *
 * On first render the spring always starts from 0, creating a satisfying
 * count-up effect. On subsequent changes it animates from the current
 * displayed value to the new one.
 *
 * @param value      Target numeric value to animate to
 * @param className  Optional Tailwind / CSS class forwarded to the span
 */
export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      motionValue.set(0);
    }
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}
