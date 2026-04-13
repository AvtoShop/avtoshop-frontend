import { useNavigate } from 'react-router-dom';
import { BRAND_COPY, CONTACT_INFO, NAV_ITEMS } from '../lib/constants';
import { sectionShellClass } from './ui';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-white/10 bg-black/40 py-10">
      <div className={sectionShellClass}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
          <div>
            <p className="font-display text-2xl font-semibold uppercase tracking-[0.2em] text-copy">{BRAND_COPY.name}</p>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted">
              Надёжный автосервис в Тихорецке с честной диагностикой, понятным объёмом работ и локальным fallback-режимом для сайта и админ-панели.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">Навигация</p>
            <div className="mt-4 flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-fit text-sm text-muted transition hover:text-copy"
                  onClick={() => navigate({ pathname: '/', hash: `#${item.id}` })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">Контакты</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
              <p>
                {CONTACT_INFO.city}, {CONTACT_INFO.address}
              </p>
              <a className="block transition hover:text-copy" href={CONTACT_INFO.primaryPhoneHref}>
                {CONTACT_INFO.primaryPhone}
              </a>
              <a className="block transition hover:text-copy" href={CONTACT_INFO.secondaryPhoneHref}>
                {CONTACT_INFO.secondaryPhone}
              </a>
              <a className="block transition hover:text-copy" href={`mailto:${CONTACT_INFO.email}`}>
                {CONTACT_INFO.email}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-xs uppercase tracking-[0.28em] text-muted">
          © {new Date().getFullYear()} {BRAND_COPY.name}
        </div>
      </div>
    </footer>
  );
}
