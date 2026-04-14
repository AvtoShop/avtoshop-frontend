import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../lib/api';
import { setAuthSession } from '../lib/auth';
import { BRAND_COPY } from '../lib/constants';
import {
  StatusMessage,
  eyebrowClass,
  fieldClass,
  panelClass,
  primaryButtonClass,
  sectionCopyClass,
  sectionShellClass,
  sectionTitleClass
} from './ui';

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
      const result = await loginAdmin({
        email: email.trim(),
        password
      });

      setAuthSession({
        token: result.token,
        user: result.user
      });
      navigate('/admin');
    } catch (error) {
      setMessage(error.message || 'Не удалось выполнить вход.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={`${sectionShellClass} py-14 sm:py-20`}>
      <div className="grid min-h-[calc(100svh-13rem)] gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:items-center">
        <div className="max-w-2xl">
          <p className={eyebrowClass}>Вход администратора</p>
          <h1 className={`${sectionTitleClass} max-w-xl`}>Доступ к управлению каталогом через защищённую авторизацию.</h1>
          <p className={`${sectionCopyClass} mt-5`}>
            Авторизация проходит через backend API. Для доступа к админ-панели нужен корректный email и пароль администратора.
          </p>
        </div>

        <div className={`${panelClass} p-6 sm:p-8`}>
          <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">{BRAND_COPY.name}</p>
          <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
            <div className="grid gap-2">
              <label htmlFor="login-email" className="text-xs uppercase tracking-[0.24em] text-muted">
                Email
              </label>
              <input
                id="login-email"
                className={fieldClass}
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
                className={fieldClass}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>
            <button type="submit" className={primaryButtonClass} disabled={pending}>
              {pending ? 'Входим...' : 'Войти в админ-панель'}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            <StatusMessage>После успешного входа приложение сохранит токен и откроет защищённую админ-панель.</StatusMessage>
            {message ? <StatusMessage>{message}</StatusMessage> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
