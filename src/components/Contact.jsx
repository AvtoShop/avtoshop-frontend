import { CONTACT_INFO } from '../lib/constants';
import { SectionIntro, panelClass, sectionShellClass } from './ui';

export default function Contact() {
  return (
    <section id="contact" className="border-t border-white/10 py-20 sm:py-24">
      <div className={sectionShellClass}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Контакты"
              title="Приехать, позвонить или просто уточнить объём работ можно без длинной цепочки согласований."
              copy="Ориентир простой: сервис в Тихорецке, рабочий график каждый день и два прямых номера для связи по ремонту и магазину."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`${panelClass} p-6`}>
                <p className="text-xs uppercase tracking-[0.28em] text-accentSoft">Адрес</p>
                <p className="mt-4 text-lg font-semibold text-copy">
                  {CONTACT_INFO.city}, {CONTACT_INFO.address}
                </p>
              </div>
              <div className={`${panelClass} p-6`}>
                <p className="text-xs uppercase tracking-[0.28em] text-accentSoft">График</p>
                <p className="mt-4 text-lg font-semibold text-copy">{CONTACT_INFO.schedule}</p>
              </div>
              <div className={`${panelClass} p-6`}>
                <p className="text-xs uppercase tracking-[0.28em] text-accentSoft">Сервис</p>
                <a className="mt-4 block text-lg font-semibold text-copy transition hover:text-accentSoft" href={CONTACT_INFO.primaryPhoneHref}>
                  {CONTACT_INFO.primaryPhone}
                </a>
              </div>
              <div className={`${panelClass} p-6`}>
                <p className="text-xs uppercase tracking-[0.28em] text-accentSoft">Магазин</p>
                <a className="mt-4 block text-lg font-semibold text-copy transition hover:text-accentSoft" href={CONTACT_INFO.secondaryPhoneHref}>
                  {CONTACT_INFO.secondaryPhone}
                </a>
              </div>
            </div>
          </div>

          <div className={`${panelClass} min-h-[420px] overflow-hidden lg:h-full`}>
            <iframe
              title="Карта расположения AvtoShop в Тихорецке"
              src="https://yandex.ru/map-widget/v1/?ll=40.130395%2C45.870130&pt=40.130395%2C45.870130&z=17&l=map"
              className="block h-full min-h-[420px] w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
