import fs from 'node:fs';

function replaceInFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) {
    console.log('Skipping missing file:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const t of transforms) {
    if (typeof t.from === 'string') {
      content = content.split(t.from).join(t.to);
    } else if (t.from instanceof RegExp) {
      content = content.replace(t.from, t.to);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  } else {
    console.log('No changes in:', filePath);
  }
}

// 1. Home.tsx
replaceInFile('Future-Centre/client/src/features/home/Home.tsx', [
  // Imports: add Leaf, Heart, TrendingUp, HelpCircle, Compass if needed
  {
    from: '  Share2,\r\n  Sparkles,',
    to: '  Share2,\r\n  Leaf,\r\n  Heart,\r\n  TrendingUp,\r\n  HelpCircle,\r\n  Compass,'
  },
  {
    from: '  Share2,\n  Sparkles,',
    to: '  Share2,\n  Leaf,\n  Heart,\n  TrendingUp,\n  HelpCircle,\n  Compass,'
  },
  // Hero badge
  {
    from: '<Sparkles size={14} className="hero-badge-sparkle" />',
    to: '<Leaf size={14} className="hero-badge-sparkle" />'
  },
  // About kicker
  {
    from: '<div className="kicker kicker--on-dark">\r\n          <Sparkles size={14} />\r\n          <span>فلسفة الرعاية</span>',
    to: '<div className="kicker kicker--on-dark">\r\n          <Heart size={14} />\r\n          <span>فلسفة الرعاية</span>'
  },
  {
    from: '<div className="kicker kicker--on-dark">\n          <Sparkles size={14} />\n          <span>فلسفة الرعاية</span>',
    to: '<div className="kicker kicker--on-dark">\n          <Heart size={14} />\n          <span>فلسفة الرعاية</span>'
  },
  // Step 03
  {
    from: '<Sparkles size={20} />',
    to: '<TrendingUp size={20} />'
  },
  // Programs kicker
  {
    from: '<div className="kicker">\r\n              <Sparkles size={14} />\r\n              <span>اختاري بدايتكِ الصحية</span>',
    to: '<div className="kicker">\r\n              <Compass size={14} />\r\n              <span>اختاري بدايتكِ الصحية</span>'
  },
  {
    from: '<div className="kicker">\n              <Sparkles size={14} />\n              <span>اختاري بدايتكِ الصحية</span>',
    to: '<div className="kicker">\n              <Compass size={14} />\n              <span>اختاري بدايتكِ الصحية</span>'
  },
  // Featured monthly badge
  {
    from: '<Sparkles size={14} />\r\n                <span>البرنامج الأكثر طلباً وتفضيلاً بالمركز</span>',
    to: '<Award size={14} />\r\n                <span>البرنامج الأكثر طلباً وتفضيلاً بالمركز</span>'
  },
  {
    from: '<Sparkles size={14} />\n                <span>البرنامج الأكثر طلباً وتفضيلاً بالمركز</span>',
    to: '<Award size={14} />\n                <span>البرنامج الأكثر طلباً وتفضيلاً بالمركز</span>'
  },
  // Doctor under badge
  {
    from: '<Sparkles size={16} />\r\n              <span>خبرة معتمدة في التغذية الإكلينيكية ونحت القوام</span>',
    to: '<Award size={16} />\r\n              <span>خبرة معتمدة في التغذية الإكلينيكية ونحت القوام</span>'
  },
  {
    from: '<Sparkles size={16} />\n              <span>خبرة معتمدة في التغذية الإكلينيكية ونحت القوام</span>',
    to: '<Award size={16} />\n              <span>خبرة معتمدة في التغذية الإكلينيكية ونحت القوام</span>'
  },
  // FAQ kicker
  {
    from: '<div className="kicker">\r\n              <Sparkles size={14} />\r\n              <span>قبل الخطوة الأولى</span>',
    to: '<div className="kicker">\r\n              <HelpCircle size={14} />\r\n              <span>قبل الخطوة الأولى</span>'
  },
  {
    from: '<div className="kicker">\n              <Sparkles size={14} />\n              <span>قبل الخطوة الأولى</span>',
    to: '<div className="kicker">\n              <HelpCircle size={14} />\n              <span>قبل الخطوة الأولى</span>'
  },
  // Final invite badge
  {
    from: '<Sparkles size={13} />\r\n              <span>بدايتكِ تبدأ الآن</span>',
    to: '<Leaf size={13} />\r\n              <span>بدايتكِ تبدأ الآن</span>'
  },
  {
    from: '<Sparkles size={13} />\n              <span>بدايتكِ تبدأ الآن</span>',
    to: '<Leaf size={13} />\n              <span>بدايتكِ تبدأ الآن</span>'
  }
]);

// 2. DailyOperationsPulse.tsx
replaceInFile('Future-Centre/client/src/features/admin/components/DailyOperationsPulse.tsx', [
  { from: 'Sparkles,', to: 'Activity,' },
  { from: '<Sparkles size={16} />', to: '<Activity size={16} />' }
]);

// 3. AdminAppointments.tsx
replaceInFile('Future-Centre/client/src/features/admin/appointments/AdminAppointments.tsx', [
  { from: 'Sparkles,', to: 'Activity,\n  CalendarCheck,' },
  { from: '{isCustomAgendaDate && <span className="tcq-star" title="سعة مخصصة لهذا التاريخ تحديداً"> ★</span>}', to: '{isCustomAgendaDate && <span className="tcq-custom-badge" title="سعة مخصصة لهذا التاريخ تحديداً"> (مخصص)</span>}' },
  { from: '<Sparkles size={24} color="#3c7348" />', to: '<Calendar size={24} color="#3c7348" />' },
  { from: 'icon: Sparkles,', to: 'icon: CalendarCheck,' }
]);

// 4. AdminStories.tsx
replaceInFile('Future-Centre/client/src/features/admin/stories/AdminStories.tsx', [
  { from: 'Sparkles,\r\n  Star,', to: 'Activity,\r\n  Award,\r\n  Layers,' },
  { from: 'Sparkles,\n  Star,', to: 'Activity,\n  Award,\n  Layers,' },
  { from: '<Star size={11} fill="#b45309" />', to: '<Award size={12} />' },
  {
    from: `<Star\r\n                    size={14}\r\n                    fill={s.featured ? '#f59e0b' : 'transparent'}\r\n                    color={s.featured ? '#f59e0b' : '#64748b'}\r\n                  />`,
    to: `<Award size={14} color={s.featured ? '#059669' : '#64748b'} />`
  },
  {
    from: `<Star\n                    size={14}\n                    fill={s.featured ? '#f59e0b' : 'transparent'}\n                    color={s.featured ? '#f59e0b' : '#64748b'}\n                  />`,
    to: `<Award size={14} color={s.featured ? '#059669' : '#64748b'} />`
  },
  { from: '<Sparkles size={16} color="#059669" />', to: '<Layers size={16} color="#059669" />' },
  { from: '<span>تمييز القصة في صدارة المعرض ★</span>', to: '<span>تمييز القصة في صدارة المعرض (رئيسية)</span>' }
]);

// 5. About.tsx
replaceInFile('Future-Centre/client/src/features/public/About.tsx', [
  { from: 'Sparkles', to: 'Leaf' },
  { from: '<Sparkles size={16} />', to: '<Leaf size={16} />' }
]);

// 6. CareGuideQuiz.tsx
replaceInFile('Future-Centre/client/src/features/home/components/CareGuideQuiz.tsx', [
  { from: 'Sparkles', to: 'Award' },
  { from: '<Sparkles size={16} />', to: '<Award size={16} />' }
]);

// 7. BmiCalculator.tsx
replaceInFile('Future-Centre/client/src/features/home/components/BmiCalculator.tsx', [
  { from: ', Sparkles', to: '' },
  { from: '<Sparkles size={16} aria-hidden="true" />', to: '<Scale size={16} aria-hidden="true" />' }
]);

// 8. ProgramInterest.tsx
replaceInFile('Future-Centre/client/src/components/ProgramInterest.tsx', [
  { from: 'Sparkles,', to: 'Award,' },
  { from: '<Sparkles size={12} />', to: '<Award size={12} />' }
]);

console.log('All replacements completed!');
