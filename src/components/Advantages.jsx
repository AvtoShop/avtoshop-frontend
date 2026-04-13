import { ADVANTAGES } from '../lib/constants';
import { SectionIntro } from './ui';

export default function Advantages() {
  return (
    <section id="advantages" className="py-20 sm:py-24">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <SectionIntro
            eyebrow="Почему AvtoShop"
            title="Сервис с рабочей дисциплиной, а не с витринной подачей."
            copy="Нам важнее читаемая диагностика, прозрачный список работ и предсказуемый результат, чем громкие обещания. Поэтому каждый блок процесса виден заранее."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {ADVANTAGES.map((item) => (
              <article key={item.title} className="panel h-full p-6">
                <p className="font-display text-4xl font-semibold uppercase tracking-[0.08em] text-accentSoft">{item.metric}</p>
                <h3 className="mt-5 text-lg font-semibold uppercase tracking-[0.08em] text-copy">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
