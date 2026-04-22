import { useNavigate } from 'react-router-dom';
import heroImage from '../../../assets/3d-car-with-simple-background_23-2150796882.avif';
import { BRAND_COPY, CONTACT_INFO } from '../../../shared/config/content';
import { panelClass, primaryButtonClass, secondaryButtonClass, sectionShellClass } from '../../../shared/ui/kit';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative -mt-24 min-h-screen min-h-[100svh] overflow-hidden pt-24">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Автомобиль в сервисной зоне" className="h-full w-full object-cover object-center opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,9,0.92)_0%,rgba(9,9,9,0.82)_42%,rgba(9,9,9,0.46)_100%)]" />
        <div className="absolute inset-0 bg-grid bg-[size:56px_56px] opacity-[0.08]" />
      </div>

      <div className={`${sectionShellClass} relative flex min-h-screen min-h-[100svh] items-end pb-14 pt-28 sm:items-center sm:pb-20`}>
        <div className="grid w-full items-end gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(300px,0.55fr)]">
          <div className="max-w-3xl animate-fade-up">
            <p className="mb-5 text-sm uppercase tracking-[0.42em] text-accentSoft">{BRAND_COPY.name}</p>
            <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-[0.98] tracking-[0.01em] text-white sm:text-6xl lg:text-7xl">
              {BRAND_COPY.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white sm:text-lg">{BRAND_COPY.heroText}</p>
            <p className="mt-4 max-w-xl text-sm leading-7 !text-white sm:text-base">{BRAND_COPY.heroSupporting}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" className={primaryButtonClass} onClick={() => navigate({ pathname: '/', hash: '#services' })}>
                Смотреть услуги
              </button>
              <a className={secondaryButtonClass} href={CONTACT_INFO.primaryPhoneHref}>
                Позвонить в сервис
              </a>
            </div>
          </div>

          <div className={`${panelClass} relative overflow-hidden p-6 sm:p-8 lg:ml-auto lg:max-w-md`}>
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accentSoft to-transparent animate-pulseline" />
            <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">Сервисный бокс</p>
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Локация</p>
                <p className="mt-2 text-2xl font-semibold text-copy">{CONTACT_INFO.city}</p>
                <p className="mt-1 text-sm text-muted">{CONTACT_INFO.address}</p>
              </div>
              <div className="grid gap-4 border-y border-white/10 py-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">График</p>
                  <p className="mt-2 text-sm leading-6 text-copy">{CONTACT_INFO.schedule}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Контакт</p>
                  <p className="mt-2 text-sm leading-6 text-copy">{CONTACT_INFO.primaryPhone}</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-white">
                {BRAND_COPY.cityLine}. Работаем с регулярным обслуживанием, ходовой, тормозной системой, электрикой и подготовкой к дальней дороге.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
