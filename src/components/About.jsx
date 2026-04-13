import { SectionIntro } from './ui';

export default function About() {
  return (
    <section id="about" className="border-y border-white/10 py-20 sm:py-24">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-start">
          <SectionIntro
            eyebrow="О сервисе"
            title="Работаем как мастерская с постоянным потоком, а не как шумный ресепшен."
            copy="Сильная сторона AvtoShop не в декорациях, а в процессе: принять автомобиль, быстро локализовать проблему, согласовать объём работ и вернуть машину без сюрпризов в заказ-наряде."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="panel p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">Подход</p>
              <p className="mt-5 text-sm leading-7 text-muted sm:text-base">
                Работаем с любым уровнем задач: от планового обслуживания до поиска плавающих неисправностей по ходовой, тормозам и электрике.
              </p>
            </div>
            <div className="panel p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">Коммуникация</p>
              <p className="mt-5 text-sm leading-7 text-muted sm:text-base">
                Объясняем по-человечески, что именно происходит с автомобилем, какие работы обязательны сейчас и что можно перенести без риска.
              </p>
            </div>
            <div className="panel p-6 sm:col-span-2 sm:p-7">
              <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">Результат</p>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-muted sm:text-base">
                Для клиента это выглядит просто: понятная диагностика, чистый сервисный процесс, фиксация цены до старта работ и аккуратная выдача автомобиля с рекомендациями на следующий интервал обслуживания.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
