import type { Service } from '../../../shared/model/types';
import { SectionIntro, StatusMessage, sectionShellClass } from '../../../shared/ui/kit';

interface ServicesSectionProps {
  services: Service[];
  expandedServiceId: number | null;
  loading: boolean;
  message: string;
  serviceCountLabel: string;
  onToggleService: (id: number) => void;
}

export function ServicesSection({
  services,
  expandedServiceId,
  loading,
  message,
  serviceCountLabel,
  onToggleService
}: ServicesSectionProps) {
  return (
    <section id="services" className="border-t border-white/10 py-20 sm:py-24">
      <div className={sectionShellClass}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            eyebrow="Каталог услуг"
            title="Основные работы, с которых начинается нормальный сервис."
            copy="Сначала диагностируем и объясняем объём работ, затем называем стоимость и фиксируем сроки. Без случайных замен и лишних операций."
          />
          <div className="rounded-full border border-white/10 px-5 py-3 text-sm uppercase tracking-[0.24em] text-muted">
            {serviceCountLabel}
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {loading ? <StatusMessage>Загружаем список услуг...</StatusMessage> : null}
          {!loading && message ? <StatusMessage>{message}</StatusMessage> : null}
        </div>

        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {services.map((service, index) => {
            const expanded = expandedServiceId === service.id;

            return (
              <article
                key={service.id}
                className="grid gap-5 py-6 transition duration-300 md:grid-cols-[120px_minmax(0,1fr)_180px] md:items-start"
              >
                <span className="text-left text-sm uppercase tracking-[0.32em] text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <button
                  type="button"
                  className="group text-left"
                  aria-expanded={expanded}
                  aria-controls={`service-description-${service.id}`}
                  onClick={() => onToggleService(service.id)}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <h3 className="max-w-2xl font-sans text-2xl font-semibold leading-tight tracking-[0.01em] text-copy transition duration-300 group-hover:text-accentSoft">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted md:hidden">{service.price}</p>
                  </div>
                  <div
                    id={`service-description-${service.id}`}
                    className={`grid transition-all duration-300 ${expanded ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-70'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">{service.description}</p>
                    </div>
                  </div>
                </button>

                <div className="flex items-start justify-between gap-4 md:flex-col md:items-end">
                  <p className="text-lg font-semibold text-copy">{service.price}</p>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.26em] text-accentSoft"
                    aria-expanded={expanded}
                    aria-controls={`service-description-${service.id}`}
                    onClick={() => onToggleService(service.id)}
                  >
                    {expanded ? 'Свернуть' : 'Подробнее'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
