import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins once
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
  duration: 0.8,
  durationFast: 0.6,
  durationSlow: 1.0,
  stagger: 0.09,
  yOffset: 20,
} as const;

export { gsap, ScrollTrigger, useGSAP };
