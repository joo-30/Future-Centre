import fs from 'fs';
import path from 'path';

console.log('🎬 Applying professional, elegant GSAP motion across pages using robust fromTo...');

// 1. SuccessStoriesSection.tsx
const storiesPath = path.resolve('client/src/features/home/components/SuccessStoriesSection.tsx');
let storiesCode = fs.readFileSync(storiesPath, 'utf8');

if (!storiesCode.includes('useGSAP')) {
  storiesCode = storiesCode.replace(
    "import { useCallback, useEffect, useMemo, useState } from 'react';",
    "import { useCallback, useEffect, useMemo, useRef, useState } from 'react';\nimport { gsap, isReducedMotion, useGSAP } from '../../../lib/motion';"
  );

  storiesCode = storiesCode.replace(
    'export function SuccessStoriesSection() {',
    `export function SuccessStoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion() || !sectionRef.current) return;

      gsap.fromTo(
        '.stories-section-title-wrap, .stories-trust-box',
        { opacity: 0, y: 16 },
        {
          scrollTrigger: {
            trigger: '.stories-section-head',
            start: 'top 85%',
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        '.transform-card-compact',
        { opacity: 0, y: 18 },
        {
          scrollTrigger: {
            trigger: '.transformations-grid',
            start: 'top 85%',
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    },
    { scope: sectionRef, dependencies: [stories.length] }
  );`
  );

  storiesCode = storiesCode.replace(
    '<section className="stories-section" id="stories" aria-label="قصص وتجارب النجاح">',
    '<section ref={sectionRef} className="stories-section" id="stories" aria-label="قصص وتجارب النجاح">'
  );

  fs.writeFileSync(storiesPath, storiesCode, 'utf8');
  console.log('✅ Integrated GSAP ScrollTrigger in SuccessStoriesSection.tsx');
}

// 2. CareGuideQuiz.tsx
const quizPath = path.resolve('client/src/features/home/components/CareGuideQuiz.tsx');
let quizCode = fs.readFileSync(quizPath, 'utf8');

if (!quizCode.includes('isReducedMotion')) {
  quizCode = quizCode.replace(
    "import { useState } from 'react';",
    "import { useEffect, useRef, useState } from 'react';\nimport { gsap, isReducedMotion } from '../../../lib/motion';"
  );

  quizCode = quizCode.replace(
    'export function CareGuideQuiz({ whatsappNumber }: { whatsappNumber?: string }) {',
    `export function CareGuideQuiz({ whatsappNumber }: { whatsappNumber?: string }) {
  const quizCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isReducedMotion() || !quizCardRef.current) return;
    gsap.fromTo(
      quizCardRef.current,
      { opacity: 0.7, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [step, isCompleted]);`
  );

  quizCode = quizCode.replace(
    '<div className="quiz-card">',
    '<div ref={quizCardRef} className="quiz-card">'
  );

  quizCode = quizCode.replace(
    '<div className="quiz-result-card">',
    '<div ref={quizCardRef} className="quiz-result-card">'
  );

  fs.writeFileSync(quizPath, quizCode, 'utf8');
  console.log('✅ Integrated step motion in CareGuideQuiz.tsx');
}

// 3. Programs.tsx
const progPath = path.resolve('client/src/features/public/Programs.tsx');
let progCode = fs.readFileSync(progPath, 'utf8');

if (!progCode.includes('useGSAP')) {
  progCode = progCode.replace(
    "import { useState } from 'react';",
    "import { useRef, useState } from 'react';\nimport { gsap, isReducedMotion, useGSAP } from '../../lib/motion';"
  );

  progCode = progCode.replace(
    'export function Programs() {',
    `export function Programs() {
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion() || !mainRef.current || !data) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('.public-intro', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo('.program-detail-card', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, '-=0.35');
    },
    { scope: mainRef, dependencies: [data] }
  );`
  );

  progCode = progCode.replace(
    '<main className="public-page">',
    '<main ref={mainRef} className="public-page">'
  );

  fs.writeFileSync(progPath, progCode, 'utf8');
  console.log('✅ Integrated GSAP motion in Programs.tsx');
}

// 4. About.tsx
const aboutPath = path.resolve('client/src/features/public/About.tsx');
let aboutCode = fs.readFileSync(aboutPath, 'utf8');

if (!aboutCode.includes('useGSAP')) {
  aboutCode = aboutCode.replace(
    "import { Leaf } from 'lucide-react';",
    "import { Leaf } from 'lucide-react';\nimport { useRef } from 'react';\nimport { gsap, isReducedMotion, useGSAP } from '../../lib/motion';"
  );

  aboutCode = aboutCode.replace(
    'export function About() {',
    `export function About() {
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion() || !mainRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('.public-intro', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo('.about-page .prose p', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.35')
        .fromTo('.about-photo-wrap', { opacity: 0, scale: 0.98, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.4');

      gsap.fromTo(
        '.about-doctor-card',
        { opacity: 0, y: 18 },
        {
          scrollTrigger: {
            trigger: '.about-doctor-card',
            start: 'top 85%',
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power2.out',
        }
      );
    },
    { scope: mainRef }
  );`
  );

  aboutCode = aboutCode.replace(
    '<main className="public-page">',
    '<main ref={mainRef} className="public-page">'
  );

  fs.writeFileSync(aboutPath, aboutCode, 'utf8');
  console.log('✅ Integrated GSAP motion in About.tsx');
}

// 5. Contact.tsx
const contactPath = path.resolve('client/src/features/public/Contact.tsx');
let contactCode = fs.readFileSync(contactPath, 'utf8');

if (!contactCode.includes('useGSAP')) {
  contactCode = contactCode.replace(
    "import { MapPin } from 'lucide-react';",
    "import { MapPin } from 'lucide-react';\nimport { useRef } from 'react';\nimport { gsap, isReducedMotion, useGSAP } from '../../lib/motion';"
  );

  contactCode = contactCode.replace(
    'export function Contact() {',
    `export function Contact() {
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion() || !mainRef.current || !data) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('.public-intro', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo('.contact-page-grid .panel', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, '-=0.35');
    },
    { scope: mainRef, dependencies: [data] }
  );`
  );

  contactCode = contactCode.replace(
    '<main className="public-page">',
    '<main ref={mainRef} className="public-page">'
  );

  fs.writeFileSync(contactPath, contactCode, 'utf8');
  console.log('✅ Integrated GSAP motion in Contact.tsx');
}

console.log('🎉 GSAP Motion Design suite successfully applied to all pages!');
