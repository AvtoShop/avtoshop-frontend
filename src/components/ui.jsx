export const appShellClass =
  'relative min-h-screen overflow-x-hidden bg-base [background-image:radial-gradient(circle_at_top_right,rgba(217,119,6,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_24%)]';

export const sectionShellClass = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10';
export const eyebrowClass =
  'mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.34em] text-accentSoft';
export const sectionTitleClass =
  'font-sans text-3xl font-semibold leading-[1.02] tracking-[0.01em] text-copy sm:text-4xl';
export const sectionCopyClass = 'max-w-2xl text-sm leading-7 text-muted sm:text-base';
export const primaryButtonClass =
  'inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition duration-300 hover:bg-accentSoft disabled:cursor-not-allowed disabled:opacity-70';
export const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-copy transition duration-300 hover:border-accent/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70';
export const fieldClass =
  'w-full rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-copy outline-none transition duration-200 placeholder:text-muted focus:border-accent/70 focus:bg-white/[0.08]';
export const panelClass = 'rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-panel backdrop-blur';
export const statusNoteClass =
  'rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-muted';
export const statusErrorClass =
  'rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm leading-6 text-copy';

export function SectionIntro({ eyebrow, title, copy, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <span className={eyebrowClass}>{eyebrow}</span>
      <h2 className={sectionTitleClass}>{title}</h2>
      {copy ? <p className={`${sectionCopyClass} mt-4`}>{copy}</p> : null}
    </div>
  );
}

export function StatusMessage({ tone = 'note', children }) {
  const className = tone === 'error' ? statusErrorClass : statusNoteClass;
  return <div className={className}>{children}</div>;
}

export function StarRating({ rating }) {
  const safeRating = Math.min(5, Math.max(1, Number(rating) || 1));

  return (
    <div aria-label={`Оценка ${safeRating} из 5`} className="flex gap-1 text-accentSoft">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < safeRating ? 'opacity-100' : 'opacity-25'}>
          ★
        </span>
      ))}
    </div>
  );
}
