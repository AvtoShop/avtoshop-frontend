export function SectionIntro({ eyebrow, title, copy, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      {copy ? <p className="section-copy mt-4">{copy}</p> : null}
    </div>
  );
}

export function StatusMessage({ tone = 'note', children }) {
  const className = tone === 'error' ? 'status-error' : 'status-note';
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
