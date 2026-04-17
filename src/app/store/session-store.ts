import { makeAutoObservable } from 'mobx';
import { logoutAdmin } from '../../shared/api/auth-api';
import { ADMIN_STORAGE_KEY } from '../../shared/config/content';
import type { AuthSession } from '../../shared/model/types';

export class SessionStore {
  session: AuthSession | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.restore();
  }

  get isAuthenticated(): boolean {
    return Boolean(this.session?.token);
  }

  get token(): string | null {
    return this.session?.token ?? null;
  }

  restore(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const rawValue = window.localStorage.getItem(ADMIN_STORAGE_KEY);

    if (!rawValue) {
      this.session = null;
      return;
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<AuthSession>;
      if (!parsed.token || !parsed.user) {
        this.clearPersistedSession();
        return;
      }

      this.session = {
        token: parsed.token,
        user: parsed.user
      };
    } catch {
      this.clearPersistedSession();
    }
  }

  login(session: AuthSession): void {
    this.session = session;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
    }
  }

  async logout(): Promise<void> {
    try {
      await logoutAdmin(this.token);
    } catch {
      // Local auth must still be cleared when the backend is unavailable.
    } finally {
      this.clearPersistedSession();
    }
  }

  clearPersistedSession(): void {
    this.session = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }
}
