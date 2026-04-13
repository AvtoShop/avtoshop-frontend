import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BRAND_COPY, NAV_ITEMS } from '../lib/constants';
import { getAdminAuthState, subscribeToAdminAuth } from '../lib/auth';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(getAdminAuthState());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    const unsubscribe = subscribeToAdminAuth(setIsAdmin);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const goToSection = (sectionId) => {
    navigate({ pathname: '/', hash: `#${sectionId}` });
  };

  const headerChrome =
    scrolled || location.pathname !== '/'
      ? 'border-white/10 bg-black/75 backdrop-blur-xl'
      : 'border-transparent bg-black/20';

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`pointer-events-auto mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 py-3 shadow-glow transition duration-300 sm:px-6 ${headerChrome}`}
      >
        <button
          type="button"
          className="font-display text-lg font-semibold uppercase tracking-[0.22em] text-copy"
          onClick={() => navigate('/')}
        >
          {BRAND_COPY.name}
        </button>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-muted transition hover:text-copy"
              onClick={() => goToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted transition hover:text-copy"
            onClick={() => navigate('/login')}
          >
            Вход
          </button>
          <button type="button" className="btn-secondary !px-4 !py-2" onClick={() => navigate(isAdmin ? '/admin' : '/login')}>
            {isAdmin ? 'Панель' : 'Админ'}
          </button>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-copy lg:hidden"
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
          </span>
        </button>
      </div>

      {menuOpen ? (
        <div className="pointer-events-auto mx-auto mt-3 max-w-7xl rounded-[2rem] border border-white/10 bg-black/85 p-5 shadow-glow backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded-2xl border border-white/10 px-4 py-3 text-left text-sm font-medium text-copy"
                onClick={() => goToSection(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="rounded-2xl border border-white/10 px-4 py-3 text-left text-sm font-medium text-copy"
              onClick={() => navigate('/login')}
            >
              Вход
            </button>
            <button type="button" className="btn-primary" onClick={() => navigate(isAdmin ? '/admin' : '/login')}>
              {isAdmin ? 'Открыть админку' : 'Войти как администратор'}
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
