import { useEffect, useState } from 'react';
import { loadTestimonials, submitTestimonial } from '../lib/api';
import { SectionIntro, StarRating, StatusMessage } from './ui';

const emptyForm = {
  name: '',
  text: '',
  rating: 5
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitState, setSubmitState] = useState({ pending: false, message: '', tone: 'note' });

  useEffect(() => {
    let mounted = true;

    loadTestimonials().then((result) => {
      if (!mounted) {
        return;
      }

      setTestimonials(result.reviews);
      setMessage(result.message);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.text.trim()) {
      setSubmitState({
        pending: false,
        message: 'Заполните имя и текст отзыва, чтобы отправить форму.',
        tone: 'error'
      });
      return;
    }

    setSubmitState({ pending: true, message: '', tone: 'note' });
    const result = await submitTestimonial(formData);

    setTestimonials((current) => [result.review, ...current]);
    setFormData(emptyForm);
    setFormVisible(false);
    setSubmitState({
      pending: false,
      message: result.offline
        ? 'Сервер недоступен. Отзыв сохранён локально для демо-режима.'
        : 'Спасибо. Отзыв успешно отправлен.',
      tone: 'note'
    });
  };

  return (
    <section id="testimonials" className="py-20 sm:py-24">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Отзывы клиентов"
              title="Говорим не за сервис, а показываем, как его воспринимают клиенты."
              copy="Отзывы загружаются с сервера, а при его недоступности остаются доступны в локальном режиме. Новые отзывы тоже не теряются в демо-сценарии."
            />

            {loading ? <StatusMessage>Загружаем отзывы...</StatusMessage> : null}
            {!loading && message ? <StatusMessage>{message}</StatusMessage> : null}
            {!loading && submitState.message ? (
              <StatusMessage tone={submitState.tone}>{submitState.message}</StatusMessage>
            ) : null}
          </div>

          <div className="space-y-4">
            {testimonials.length === 0 && !loading ? (
              <StatusMessage>Пока нет отзывов. Вы можете оставить первый комментарий ниже.</StatusMessage>
            ) : null}

            {testimonials.map((review) => (
              <article key={review.id} className="panel p-6 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold uppercase tracking-[0.08em] text-copy">{review.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{review.text}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
              </article>
            ))}

            <div className="panel p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">Форма отзыва</p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Отзыв отправляется на API, а если сервер недоступен, сохраняется локально для предпросмотра.
                  </p>
                </div>
                <button type="button" className="btn-secondary" onClick={() => setFormVisible((value) => !value)}>
                  {formVisible ? 'Скрыть форму' : 'Оставить отзыв'}
                </button>
              </div>

              {formVisible ? (
                <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                  <input
                    className="field"
                    type="text"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                  <textarea
                    className="field min-h-32 resize-y"
                    placeholder="Как прошёл визит и что сделали"
                    value={formData.text}
                    onChange={(event) => setFormData((current) => ({ ...current, text: event.target.value }))}
                    required
                  />
                  <div className="grid gap-2">
                    <label htmlFor="testimonial-rating" className="text-xs uppercase tracking-[0.24em] text-muted">
                      Оценка
                    </label>
                    <input
                      id="testimonial-rating"
                      className="field"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          rating: Math.min(5, Math.max(1, Number(event.target.value) || 1))
                        }))
                      }
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={submitState.pending}>
                    {submitState.pending ? 'Отправляем...' : 'Отправить отзыв'}
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
