import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAdminAuthState } from '../lib/auth';
import { BRAND_COPY } from '../lib/constants';
import { StatusMessage } from './ui';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setPending(true);
    setMessage('');

    try {
      setAdminAuthState(true);
      setMessage('Демо-вход выполнен. Админ-панель доступна даже без ответа сервера.');
      navigate('/admin');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="section-shell py-14 sm:py-20">
      <div className="grid min-h-[calc(100svh-13rem)] gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:items-center">
        <div className="max-w-2xl">
          <p className="eyebrow">Вход администратора</p>
          <h1 className="section-title max-w-xl">Доступ к управлению каталогом и локальному демо-режиму.</h1>
          <p className="section-copy mt-5">
            Маршрут и логика доступа сохранены, но авторизация остаётся не блокирующей: если backend недоступен, панель всё равно открывается для локального предпросмотра.
          </p>
        </div>

        <div className="panel p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">{BRAND_COPY.name}</p>
          <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
            <div className="grid gap-2">
              <label htmlFor="login-email" className="text-xs uppercase tracking-[0.24em] text-muted">
                Email
              </label>
              <input
                id="login-email"
                className="field"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@avtoshop.ru"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="login-password" className="text-xs uppercase tracking-[0.24em] text-muted">
                Пароль
              </label>
              <input
                id="login-password"
                className="field"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? 'Входим...' : 'Войти в админ-панель'}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            <StatusMessage>
              Демо-режим сохранён: форма принимает данные и открывает защищённый маршрут даже без онлайн-авторизации.
            </StatusMessage>
            {message ? <StatusMessage>{message}</StatusMessage> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
