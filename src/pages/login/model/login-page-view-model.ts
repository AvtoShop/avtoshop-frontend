import { makeAutoObservable, runInAction } from 'mobx';
import type { NavigateFunction } from 'react-router-dom';
import { loginAdmin } from '../../../shared/api/auth-api';
import type { SessionStore } from '../../../app/store/session-store';

export class LoginPageViewModel {
  email = '';
  password = '';
  pending = false;
  message = '';
  private navigate: NavigateFunction;
  private sessionStore: SessionStore;
  private redirectTo: string;

  constructor(sessionStore: SessionStore, navigate: NavigateFunction, redirectTo: string) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.sessionStore = sessionStore;
    this.navigate = navigate;
    this.redirectTo = redirectTo;
  }

  setEmail(value: string): void {
    this.email = value;
  }

  setPassword(value: string): void {
    this.password = value;
  }

  async submit(): Promise<void> {
    runInAction(() => {
      this.pending = true;
      this.message = '';
    });

    try {
      const result = await loginAdmin({
        email: this.email.trim(),
        password: this.password
      });

      this.sessionStore.login(result);
      this.navigate(this.redirectTo, { replace: true });
    } catch (error) {
      runInAction(() => {
        this.message = error instanceof Error ? error.message : 'Не удалось выполнить вход.';
      });
    } finally {
      runInAction(() => {
        this.pending = false;
      });
    }
  }
}
