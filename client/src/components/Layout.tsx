import { normalizePhone } from '@future/shared';
import { ArrowLeft, LogIn, Menu, Phone, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { whatsappUrl } from '../lib/api';
import { useAuth } from './Auth';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { Brand, ButtonLink } from './ui';
import { Footer } from './Footer';

const links = [
  ['/', 'الرئيسية'],
  ['/about', 'عن المركز'],
  ['/programs', 'برامجنا'],
  ['/articles', 'مقالات ونصائح'],
  ['/contact', 'تواصل معنا'],
];
export function Layout() {
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const { data } = useCatalog();
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  return (
    <>
      <a className="skip-link" href="#main-content">
        انتقلي إلى المحتوى
      </a>
      <header className="site-head">
        <div className="site-head-container">
          <Brand />
          <nav className="nav-capsule" aria-label="التنقل الرئيسي">
            {links.slice(0, 4).map(([to, t]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-capsule-link ${isActive ? 'is-active' : ''}`}
              >
                <span>{t}</span>
              </NavLink>
            ))}
          </nav>
          <div className="head-actions">
            {user ? (
              <Link to="/account" className="head-auth-pill is-patient" title="حسابي">
                <UserRound size={16} />
                <span>حسابي</span>
              </Link>
            ) : (
              <Link to="/login" className="head-auth-pill is-guest" title="تسجيل الدخول">
                <LogIn size={16} />
                <span>تسجيل الدخول</span>
              </Link>
            )}
            <ButtonLink to="/booking" className="head-cta-btn">
              احجزي موعدك
            </ButtonLink>
          </div>
          <button
            className="menu-mobile icon-button"
            aria-expanded={menu}
            aria-controls="mobile-navigation"
            aria-label={menu ? 'إغلاق القائمة' : 'فتح القائمة'}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>
      {menu && (
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="قائمة الهاتف">
          {links.map(([to, t]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? 'active is-active' : ''}`
              }
              onClick={() => setMenu(false)}
            >
              {({ isActive }) => (
                <>
                  <span className="nav-link-label">
                    <span className="nav-title">{t}</span>
                    {isActive && <span className="nav-current-pill">الصفحة الحالية</span>}
                  </span>
                  <div className="nav-link-meta">
                    {isActive && <span className="nav-active-dot" aria-hidden="true" />}
                    <ArrowLeft size={18} />
                  </div>
                </>
              )}
            </NavLink>
          ))}
          <NavLink
            to={user ? '/account' : '/login'}
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? 'active is-active' : ''}`
            }
            onClick={() => setMenu(false)}
          >
            {({ isActive }) => (
              <>
                <span className="nav-link-label">
                  <span className="nav-title">
                    {user ? 'حسابي' : 'تسجيل الدخول'}
                  </span>
                  {isActive && <span className="nav-current-pill">الصفحة الحالية</span>}
                </span>
                <div className="nav-link-meta">
                  {isActive && <span className="nav-active-dot" aria-hidden="true" />}
                  <ArrowLeft size={18} />
                </div>
              </>
            )}
          </NavLink>
          <ButtonLink
            to="/booking"
            className={location.pathname === '/booking' ? 'btn-nav-active' : ''}
            onClick={() => setMenu(false)}
          >
            احجزي موعدك
          </ButtonLink>
        </nav>
      )}
      <div id="main-content" tabIndex={-1}>
        <Outlet />
      </div>
      <Footer />
      {data?.clinic.whatsapp && location.pathname !== '/booking' && (
        <a
          className="whatsapp"
          href={whatsappUrl(data.clinic.whatsapp, 'أهلًا، أود الاستفسار عن خدمات مركز المستقبل.')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصلي مع مركز المستقبل على واتساب"
        >
          <WhatsAppIcon size={30} color="#ffffff" />
        </a>
      )}
    </>
  );
}
export function ContactNumbers() {
  const { data } = useCatalog();
  return (
    <div className="contact-numbers">
      {data?.clinic.phones.map((p) => (
        <a href={'tel:' + normalizePhone(p)} key={p}>
          <Phone size={20} />
          <bdi dir="ltr">{p}</bdi>
        </a>
      ))}
    </div>
  );
}
