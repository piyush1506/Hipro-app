import React, { useEffect, useRef, useState } from 'react';

/**
 * Easing curve for count-up animations (ease-out cubic).
 * Starts fast and decelerates so the final value lands softly.
 */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const canAnimate = () => {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    return false;
  }
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  return true;
};

/**
 * Animates a numeric value towards `target` whenever it changes.
 * Falls back to an instant update when the environment cannot animate
 * (SSR, reduced motion preference, missing requestAnimationFrame).
 */
export function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const numericTarget = Number.isFinite(Number(target)) ? Number(target) : 0;
    const from = valueRef.current;

    if (from === numericTarget) return undefined;

    if (!canAnimate() || duration <= 0) {
      valueRef.current = numericTarget;
      setValue(numericTarget);
      return undefined;
    }

    const startedAt = (typeof performance !== 'undefined' ? performance.now() : Date.now());

    const tick = (now) => {
      const elapsed = now - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const next = from + (numericTarget - from) * eased;

      valueRef.current = next;
      setValue(next);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        valueRef.current = numericTarget;
        setValue(numericTarget);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [target, duration]);

  return value;
}

/**
 * Renders a number that counts up to its latest value.
 *
 * @param {number} value               target value
 * @param {number} duration            animation duration in ms
 * @param {(n:number)=>string} format  optional formatter applied to the animated value
 */
export default function AnimatedNumber({
  value,
  duration = 1200,
  format = (n) => Math.round(n).toLocaleString('en-IN'),
  className = '',
  style,
}) {
  const animated = useCountUp(value, duration);

  return (
    <span className={className} style={style}>
      {format(animated)}
    </span>
  );
}
