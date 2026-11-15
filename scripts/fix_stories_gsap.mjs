import fs from 'fs';
import path from 'path';

const p = path.resolve('client/src/features/home/components/SuccessStoriesSection.tsx');
let content = fs.readFileSync(p, 'utf8');

const targetUseGsap = `  useGSAP(
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
  );`;

// Normalize line endings
content = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetUseGsap.replace(/\r\n/g, '\n');

if (content.includes(normalizedTarget)) {
  content = content.replace(normalizedTarget, '');
  content = content.replace(
    'const stories = storiesQuery.data?.stories || [];',
    `const stories = storiesQuery.data?.stories || [];\n\n${normalizedTarget}`
  );
  fs.writeFileSync(p, content, 'utf8');
  console.log('Successfully moved useGSAP in SuccessStoriesSection.tsx');
} else {
  console.error('Target useGSAP not found');
}
