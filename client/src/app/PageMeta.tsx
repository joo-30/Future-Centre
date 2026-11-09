import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const privatePage = /^\/(account|admin|login|register|recover)(\/|$)/.test(pathname);
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');

    if (privatePage) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex, nofollow';
    } else if (pathname !== '/booking/track') {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'index, follow';
    }

    document.body.dataset.page = pathname === '/' ? 'home' : 'app';

    const names: Record<string, string> = {
      '/': 'رعاية تبدأ بفهمك',
      '/programs': 'برامج التغذية والأسعار',
      '/articles': 'مقالات ونصائح التغذية',
      '/about': 'عن د. رنا وفلسفة المركز',
      '/contact': 'تواصلي معنا',
      '/booking': 'حجز موعد بالعيادة',
      '/booking/track': 'متابعة الطلب',
      '/login': 'تسجيل الدخول',
      '/register': 'إنشاء حساب',
      '/recover': 'استعادة الحساب',
      '/account': 'حسابي',
      '/admin': 'إدارة المواعيد',
      '/admin/programs': 'إدارة البرامج والأسعار',
      '/admin/patients': 'العملاء والاشتراكات',
      '/admin/settings': 'إعدادات المركز',
      '/admin/articles': 'إدارة المقالات',
      '/admin/bmi': 'حاسبة الـ BMI والسعرات',
    };

    const descriptions: Record<string, string> = {
      '/': 'عيادة متخصصة في التغذية الإكلينيكية وعلاج السمنة وتنسيق القوام بإشراف د. رنا ياسر الشوري عضو الجمعية المصرية لدراسة السمنة (EMASO). فحص InBody دقيق وخطط غذائية واقعية بكفر الزيات.',
      '/programs': 'برامج التغذية العلاجية وإدارة الوزن وتكيس المبايض والمتابعة بالعيادة في كفر الزيات.',
      '/articles': 'مفكرة التغذية والمعرفة الطبية المبسطة — مقالات ونصائح د. رنا الشوري حول التغذية المتوازنة.',
      '/about': 'تعرفي على فلسفة مركز المستقبل ود. رنا ياسر الشوري، شهاداتها الطبية، وخبراتها في التغذية الإكلينيكية.',
      '/contact': 'تواصلي مع مركز المستقبل للتغذية بكفر الزيات، العنوان، وأرقام الواتساب والاستفسارات.',
      '/booking': 'احجزي موعد كشف أو استشارة عيادة مع د. رنا ياسر الشوري في كفر الزيات بخطوات سهلة وفورية.',
    };

    const titleText = (names[pathname] || 'مركز المستقبل') + ' — مركز المستقبل للتغذية والتخسيس';
    document.title = titleText;

    // Update OpenGraph and Meta Description dynamically
    const descMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descMeta && descriptions[pathname]) {
      descMeta.content = descriptions[pathname];
    }

    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = titleText;

    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc && descriptions[pathname]) {
      ogDesc.content = descriptions[pathname];
    }

    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.content = `https://futurecenter-clinic.com${pathname}`;
    }
  }, [pathname]);

  return null;
}
