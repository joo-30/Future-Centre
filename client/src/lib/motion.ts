import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins once in browser environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const MOTION = {
  ease: 'power2.out',
  easeSmooth: 'power3.out',
  easeSoft: 'sine.out',
  duration: 0.7,
  durationFast: 0.45,
  durationSlow: 0.95,
  stagger: 0.08,
  staggerFast: 0.05,
  yOffset: 16,
  yOffsetSmall: 10,
} as const;

/**
 * Creates a serene viewport-triggered reveal for a target or list of targets.
 * Gracefully respects prefers-reduced-motion.
 */
export function sereneScrollReveal(
  trigger: string | Element,
  targets: string | Element | (string | Element)[],
  options: {
    y?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
    start?: string;
    ease?: string;
    scale?: number;
  } = {}
) {
  if (isReducedMotion()) return null;

  const {
    y = MOTION.yOffset,
    duration = MOTION.duration,
    stagger = MOTION.stagger,
    delay = 0,
    start = 'top 88%',
    ease = MOTION.ease,
    scale,
  } = options;

  const fromVars: gsap.TweenVars = {
    opacity: 0,
    y,
  };
  if (scale !== undefined) fromVars.scale = scale;

  const toVars: gsap.TweenVars = {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    delay,
    ease,
    scrollTrigger: {
      trigger,
      start,
      once: true,
    },
  };
  if (scale !== undefined) toVars.scale = 1;

  return gsap.fromTo(targets, fromVars, toVars);
}

export { gsap, ScrollTrigger, useGSAP };
