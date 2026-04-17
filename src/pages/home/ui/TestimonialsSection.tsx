import type { ChangeEvent, FormEvent } from 'react';
import type { Review, ReviewInput, StatusTone } from '../../../shared/model/types';
import {
  SectionIntro,
  StarRating,
  StatusMessage,
  fieldClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionShellClass
} from '../../../shared/ui/kit';

interface TestimonialsSectionProps {
  reviews: Review[];
  loading: boolean;
  message: string;
  formVisible: boolean;
  formData: ReviewInput;
  submitPending: boolean;
  submitMessage: string;
  submitTone: StatusTone;
  onToggleForm: () => void;
  onFieldChange: <K extends keyof ReviewInput>(field: K, value: ReviewInput[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function TestimonialsSection({
  reviews,
  loading,
  message,
  formVisible,
  formData,
  submitPending,
  submitMessage,
  submitTone,
  onToggleForm,
  onFieldChange,
  onSubmit
}: TestimonialsSectionProps) {
  const handleRatingChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('rating', Number(event.target.value));
  };

  return (
    <section id="testimonials" className="py-20 sm:py-24">
      <div className={sectionShellClass}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Отзывы клиентов"
              title="Говорим не за сервис, а показываем, как его воспринимают клиенты."
              copy="Отзывы загружаются с сервера, а при его недоступности остаются доступны в локальном режиме. Новые отзывы тоже не теряются в демо-сценарии."
            />

            {loading ? <StatusMessage>Загружаем отзывы...</StatusMessage> : null}
            {!loading && message ? <StatusMessage>{message}</StatusMessage> : null}
            {!loading && submitMessage ? <StatusMessage tone={submitTone}>{submitMessage}</StatusMessage> : null}
          </div>

          <div className="space-y-4">
            {reviews.length === 0 && !loading ? (
              <StatusMessage>Пока нет отзывов. Вы можете оставить первый комментарий ниже.</StatusMessage>
            ) : null}

            {reviews.map((review) => (
              <article key={review.id} className={`${panelClass} p-6 sm:p-7`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-sans text-lg font-semibold leading-snug tracking-[0.01em] text-copy">{review.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{review.text}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
              </article>
            ))}

            <div className={`${panelClass} p-6 sm:p-7`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">Форма отзыва</p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Отзыв отправляется на API, а если сервер недоступен, сохраняется локально для предпросмотра.
                  </p>
                </div>
                <button type="button" className={secondaryButtonClass} onClick={onToggleForm}>
                  {formVisible ? 'Скрыть форму' : 'Оставить отзыв'}
                </button>
              </div>

              {formVisible ? (
                <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
                  <input
                    className={fieldClass}
                    type="text"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(event) => onFieldChange('name', event.target.value)}
                    required
                  />
                  <textarea
                    className={`${fieldClass} min-h-32 resize-y`}
                    placeholder="Как прошёл визит и что сделали"
                    value={formData.text}
                    onChange={(event) => onFieldChange('text', event.target.value)}
                    required
                  />
                  <div className="grid gap-2">
                    <label htmlFor="testimonial-rating" className="text-xs uppercase tracking-[0.24em] text-muted">
                      Оценка
                    </label>
                    <input
                      id="testimonial-rating"
                      className={fieldClass}
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={handleRatingChange}
                      required
                    />
                  </div>
                  <button type="submit" className={primaryButtonClass} disabled={submitPending}>
                    {submitPending ? 'Отправляем...' : 'Отправить отзыв'}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
