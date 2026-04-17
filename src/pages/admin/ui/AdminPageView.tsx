import type { FormEvent } from 'react';
import { observer } from 'mobx-react-lite';
import {
  StatusMessage,
  eyebrowClass,
  fieldClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionCopyClass,
  sectionShellClass,
  sectionTitleClass
} from '../../../shared/ui/kit';
import type { AdminPageViewModel } from '../model/admin-page-view-model';

interface AdminPageViewProps {
  viewModel: AdminPageViewModel;
}

export const AdminPageView = observer(({ viewModel }: AdminPageViewProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void viewModel.submitForm();
  };

  if (viewModel.loading) {
    return (
      <section className={`${sectionShellClass} py-14 sm:py-20`}>
        <StatusMessage>Загружаем список услуг для админ-панели...</StatusMessage>
      </section>
    );
  }

  return (
    <section className={`${sectionShellClass} py-14 sm:py-20`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={eyebrowClass}>Админ-панель</p>
          <h1 className={sectionTitleClass}>Управление услугами и локальным предпросмотром.</h1>
          <p className={`${sectionCopyClass} mt-4`}>
            Создание, редактирование и удаление выполняются через backend API и требуют действующей авторизации администратора.
          </p>
        </div>
        <button type="button" className={secondaryButtonClass} onClick={() => void viewModel.logout()}>
          Выйти
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {viewModel.message ? <StatusMessage>{viewModel.message}</StatusMessage> : null}
        {viewModel.usingFallback ? (
          <StatusMessage>
            Сервер сейчас недоступен, поэтому список показан в режиме предпросмотра. Изменения недоступны, пока API не ответит.
          </StatusMessage>
        ) : null}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(360px,0.72fr)_minmax(0,1fr)]">
        <div className={`${panelClass} p-6 sm:p-8`}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-sans text-lg font-semibold leading-snug tracking-[0.01em] text-copy">
              {viewModel.editingId ? 'Редактирование услуги' : 'Новая услуга'}
            </h2>
            {viewModel.editingId ? (
              <button type="button" className="text-xs uppercase tracking-[0.24em] text-muted" onClick={viewModel.resetForm}>
                Сбросить
              </button>
            ) : null}
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <input
              className={fieldClass}
              type="text"
              name="name"
              placeholder="Название услуги"
              value={viewModel.formData.name}
              onChange={(event) => viewModel.setFormField('name', event.target.value)}
              required
            />
            <input
              className={fieldClass}
              type="text"
              name="icon"
              placeholder="Код иконки или метка"
              value={viewModel.formData.icon}
              onChange={(event) => viewModel.setFormField('icon', event.target.value)}
              required
            />
            <textarea
              className={`${fieldClass} min-h-32 resize-y`}
              name="description"
              placeholder="Описание услуги"
              value={viewModel.formData.description}
              onChange={(event) => viewModel.setFormField('description', event.target.value)}
              required
            />
            <input
              className={fieldClass}
              type="text"
              name="price"
              placeholder="Цена"
              value={viewModel.formData.price}
              onChange={(event) => viewModel.setFormField('price', event.target.value)}
              required
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className={primaryButtonClass} disabled={viewModel.pending || !viewModel.canMutate}>
                {viewModel.pending ? 'Сохраняем...' : viewModel.editingId ? 'Обновить услугу' : 'Добавить услугу'}
              </button>
              {viewModel.editingId ? (
                <button type="button" className={secondaryButtonClass} onClick={viewModel.resetForm}>
                  Отмена
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4">
            {viewModel.services.length === 0 ? (
              <StatusMessage>Список услуг пуст. Добавьте первую запись через форму слева.</StatusMessage>
            ) : null}

            {viewModel.services.map((service) => {
              const active = service.id === viewModel.selectedId;

              return (
                <article
                  key={service.id}
                  className={`${panelClass} cursor-pointer p-6 transition duration-300 ${active ? 'border-accent/60 bg-white/[0.06]' : ''}`}
                  onClick={() => viewModel.toggleSelectedService(service.id)}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-sans text-lg font-semibold leading-snug tracking-[0.01em] text-copy">{service.name}</h3>
                      <p className="mt-2 text-sm text-accentSoft">{service.price}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.26em] text-muted">{active ? 'Выбрано' : 'Открыть'}</p>
                  </div>

                  {active ? (
                    <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
                      <p className="text-sm leading-7 text-muted">{service.description}</p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          className={secondaryButtonClass}
                          onClick={(event) => {
                            event.stopPropagation();
                            viewModel.startEditing(service);
                          }}
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          className={`${secondaryButtonClass} !border-accent/30 !text-accentSoft`}
                          disabled={!viewModel.canMutate}
                          onClick={(event) => {
                            event.stopPropagation();
                            void viewModel.deleteService(service.id);
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {viewModel.selectedService ? (
            <div className={`${panelClass} p-6`}>
              <p className="text-xs uppercase tracking-[0.28em] text-accentSoft">Предпросмотр выбранной услуги</p>
              <h3 className="mt-4 font-sans text-2xl font-semibold leading-tight tracking-[0.01em] text-copy">
                {viewModel.selectedService.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{viewModel.selectedService.description}</p>
              <p className="mt-4 text-lg font-semibold text-copy">{viewModel.selectedService.price}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
});
