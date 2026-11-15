import fs from 'fs';
import path from 'path';

// 1. CareGuideQuiz.tsx
{
  const p = path.resolve('client/src/features/home/components/CareGuideQuiz.tsx');
  let content = fs.readFileSync(p, 'utf8');
  // Extract useEffect block
  const effectBlock = `  useEffect(() => {
    if (isReducedMotion() || !quizCardRef.current) return;
    gsap.fromTo(
      quizCardRef.current,
      { opacity: 0.7, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [step, isCompleted]);`;

  // Remove current effectBlock
  content = content.replace(effectBlock, '');
  // Insert it after const [isCompleted, setIsCompleted] = useState(false);
  content = content.replace(
    'const [isCompleted, setIsCompleted] = useState(false);',
    `const [isCompleted, setIsCompleted] = useState(false);\n\n${effectBlock}`
  );
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed CareGuideQuiz.tsx');
}

// 2. SuccessStoriesSection.tsx
{
  const p = path.resolve('client/src/features/home/components/SuccessStoriesSection.tsx');
  let content = fs.readFileSync(p, 'utf8');
  // Find useGSAP block
  const gsapStart = content.indexOf('  useGSAP(');
  const gsapEnd = content.indexOf('  );\n  const { data: catalogData } = useCatalog();');
  if (gsapStart !== -1 && gsapEnd !== -1) {
    const gsapBlock = content.slice(gsapStart, gsapEnd + 4);
    content = content.slice(0, gsapStart) + content.slice(gsapEnd + 4);
    // Put gsapBlock after `const stories = storiesQuery.data?.stories || [];`
    content = content.replace(
      'const stories = storiesQuery.data?.stories || [];',
      `const stories = storiesQuery.data?.stories || [];\n\n${gsapBlock}`
    );
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed SuccessStoriesSection.tsx');
  }
}

// 3. Programs.tsx
{
  const p = path.resolve('client/src/features/public/Programs.tsx');
  let content = fs.readFileSync(p, 'utf8');
  const gsapStart = content.indexOf('  useGSAP(');
  const gsapEnd = content.indexOf('  );\n  const { data, isPending');
  if (gsapStart !== -1 && gsapEnd !== -1) {
    const gsapBlock = content.slice(gsapStart, gsapEnd + 4);
    content = content.slice(0, gsapStart) + content.slice(gsapEnd + 4);
    content = content.replace(
      'const [interest, setInterest] = useState<Service | null>(null);',
      `const [interest, setInterest] = useState<Service | null>(null);\n\n${gsapBlock}`
    );
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed Programs.tsx');
  }
}

// 4. Contact.tsx
{
  const p = path.resolve('client/src/features/public/Contact.tsx');
  let content = fs.readFileSync(p, 'utf8');
  const gsapStart = content.indexOf('  useGSAP(');
  const gsapEnd = content.indexOf('  );\n  const { data, isPending');
  if (gsapStart !== -1 && gsapEnd !== -1) {
    const gsapBlock = content.slice(gsapStart, gsapEnd + 4);
    content = content.slice(0, gsapStart) + content.slice(gsapEnd + 4);
    content = content.replace(
      'const { data, isPending, error, refetch } = useCatalog();',
      `const { data, isPending, error, refetch } = useCatalog();\n\n${gsapBlock}`
    );
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed Contact.tsx');
  }
}
