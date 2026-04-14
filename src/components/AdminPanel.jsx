import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createService,
  deleteService,
  isAuthError,
  loadServices,
  logoutAdmin,
  updateService
} from '../lib/api';
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
} from './ui';

const createEmptyService = () => ({
  name: '',
  icon: '',
  description: '',
  price: ''
});

export default function AdminPanel() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState(createEmptyService());
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadServices().then((result) => {
      if (!mounted) {
        return;
      }

      setServices(result.services);
      setUsingFallback(result.usingFallback);
      setMessage(
        result.usingFallback
          ? 'Сервер недоступен или пуст. В админ-панели включён локальный предпросмотр.'
          : result.message
      );
      setSelectedId(result.services[0]?.id ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedId) ?? null,
    [selectedId, services]
  );

  const resetForm = () => {
    setFormData(createEmptyService());
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setMessage('');

    try {
      const savedService = editingId
        ? await updateService(editingId, formData)
        : await createService(formData);

      setServices((current) =>
        editingId
          ? current.map((service) => (service.id === editingId ? savedService : service))
          : [savedService, ...current]
      );
      setSelectedId(savedService.id);
      setMessage(editingId ? 'Услуга обновлена.' : 'Услуга добавлена.');
      resetForm();
    } catch (error) {
      if (isAuthError(error)) {
        await logoutAdmin();
        navigate('/login');
        return;
      }

      setMessage(error.message);
    } finally {
      setPending(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      icon: service.icon ?? '',
      description: service.description,
      price: service.price
    });
    setSelectedId(service.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить услугу из списка?')) {
      return;
    }

    setMessage('');

    try {
      await deleteService(id);
      setServices((current) => current.filter((service) => service.id !== id));
      setSelectedId((current) => (current === id ? null : current));
      if (editingId === id) {
        resetForm();
      }
      setMessage('Услуга удалена.');
    } catch (error) {
      if (isAuthError(error)) {
        await logoutAdmin();
        navigate('/login');
        return;
      }

      setMessage(error.message);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/login');
  };

  if (loading) {
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
        <button type="button" className={secondaryButtonClass} onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {message ? <StatusMessage>{message}</StatusMessage> : null}
        {usingFallback ? (
          <StatusMessage>
            Сервер сейчас недоступен, поэтому список показан в режиме предпросмотра. Изменения недоступны, пока API не ответит.
          </StatusMessage>
        ) : null}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(360px,0.72fr)_minmax(0,1fr)]">
        <div className={`${panelClass} p-6 sm:p-8`}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-sans text-lg font-semibold leading-snug tracking-[0.01em] text-copy">
              {editingId ? 'Редактирование услуги' : 'Новая услуга'}
            </h2>
            {editingId ? (
              <button type="button" className="text-xs uppercase tracking-[0.24em] text-muted" onClick={resetForm}>
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
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <input
              className={fieldClass}
              type="text"
              name="icon"
              placeholder="Код иконки или метка"
              value={formData.icon}
              onChange={(event) => setFormData((current) => ({ ...current, icon: event.target.value }))}
              required
            />
            <textarea
              className={`${fieldClass} min-h-32 resize-y`}
              name="description"
              placeholder="Описание услуги"
              value={formData.description}
              onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              required
            />
            <input
              className={fieldClass}
              type="text"
              name="price"
              placeholder="Цена"
              value={formData.price}
              onChange={(event) => setFormData((current) => ({ ...current, price: event.target.value }))}
              required
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className={primaryButtonClass} disabled={pending || usingFallback}>
                {pending ? 'Сохраняем...' : editingId ? 'Обновить услугу' : 'Добавить услугу'}
              </button>
              {editingId ? (
                <button type="button" className={secondaryButtonClass} onClick={resetForm}>
                  Отмена
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4">
            {services.length === 0 ? (
              <StatusMessage>Список услуг пуст. Добавьте первую запись через форму слева.</StatusMessage>
            ) : null}

            {services.map((service) => {
              const active = service.id === selectedId;

              return (
                <article
                  key={service.id}
                  className={`${panelClass} cursor-pointer p-6 transition duration-300 ${active ? 'border-accent/60 bg-white/[0.06]' : ''}`}
                  onClick={() => setSelectedId(active ? null : service.id)}
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
                            handleEdit(service);
                          }}
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          className={`${secondaryButtonClass} !border-accent/30 !text-accentSoft`}
                          disabled={usingFallback}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(service.id);
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

          {selectedService ? (
            <div className={`${panelClass} p-6`}>
              <p className="text-xs uppercase tracking-[0.28em] text-accentSoft">Предпросмотр выбранной услуги</p>
              <h3 className="mt-4 font-sans text-2xl font-semibold leading-tight tracking-[0.01em] text-copy">{selectedService.name}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{selectedService.description}</p>
              <p className="mt-4 text-lg font-semibold text-copy">{selectedService.price}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
