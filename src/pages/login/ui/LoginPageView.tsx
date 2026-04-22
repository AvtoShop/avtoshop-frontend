import type { FormEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { BRAND_COPY } from '../../../shared/config/content';
import {
  StatusMessage,
  eyebrowClass,
  fieldClass,
  panelClass,
  primaryButtonClass,
  sectionCopyClass,
  sectionShellClass,
  sectionTitleClass
} from '../../../shared/ui/kit';
import type { LoginPageViewModel } from '../model/login-page-view-model';

interface LoginPageViewProps {
  viewModel: LoginPageViewModel;
}

export const LoginPageView = observer(({ viewModel }: LoginPageViewProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void viewModel.submit();
  };

  return (
    <section className={`${sectionShellClass} py-14 sm:py-20`}>
      <div className="grid min-h-[calc(100vh-13rem)] min-h-[calc(100svh-13rem)] gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:items-center">
        <div className="max-w-2xl">
          <p className={eyebrowClass}>Вход администратора</p>
          <h1 className={`${sectionTitleClass} max-w-xl`}>Доступ к управлению каталогом через защищённую авторизацию.</h1>
          <p className={`${sectionCopyClass} mt-5`}>
            Авторизация проходит через backend API. Для доступа к админ-панели нужен корректный email и пароль администратора.
          </p>
        </div>

        <div className={`${panelClass} p-6 sm:p-8`}>
          <p className="text-xs uppercase tracking-[0.34em] text-accentSoft">{BRAND_COPY.name}</p>
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label htmlFor="login-email" className="text-xs uppercase tracking-[0.24em] text-muted">
                Email
              </label>
              <input
                id="login-email"
                className={fieldClass}
                type="email"
                value={viewModel.email}
                onChange={(event) => viewModel.setEmail(event.target.value)}
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
                value={viewModel.password}
                onChange={(event) => viewModel.setPassword(event.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>
            <button type="submit" className={primaryButtonClass} disabled={viewModel.pending}>
              {viewModel.pending ? 'Входим...' : 'Войти в админ-панель'}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            <StatusMessage>После успешного входа приложение сохранит токен и откроет защищённую админ-панель.</StatusMessage>
            {viewModel.message ? <StatusMessage tone="error">{viewModel.message}</StatusMessage> : null}
          </div>
        </div>
      </div>
    </section>
  );
});
