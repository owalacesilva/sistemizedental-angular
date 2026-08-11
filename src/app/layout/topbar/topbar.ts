import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { injectT } from '../../core/i18n/translate';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { LocaleSwitcher } from '../../shared/ui/locale-switcher/locale-switcher';
import { LayoutStore } from '../layout.store';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, LocaleSwitcher],
  templateUrl: './topbar.html',
})
export class Topbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly layout = inject(LayoutStore);

  protected readonly t = injectT();
  protected readonly displayName = this.auth.displayName;
  protected readonly account = this.auth.account;
  protected readonly collapsed = this.layout.sidebarCollapsed;

  protected readonly userMenuOpen = signal(false);

  /** `⌘K` reads as noise on Windows, and `Ctrl K` as noise on a Mac. */
  protected readonly shortcutHint =
    typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent)
      ? '⌘K'
      : 'Ctrl K';

  /** One button, two jobs: a drawer on a phone, a rail on a desktop. */
  protected toggleSidebar(): void {
    this.layout.toggleDrawer();
  }

  protected toggleCollapsed(): void {
    this.layout.toggleSidebarCollapsed();
  }

  protected openSearch(): void {
    this.layout.openSearch();
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  protected logout(): void {
    this.userMenuOpen.set(false);
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
