import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { Logo } from '../../shared/ui/logo/logo';
import { NAV_ITEMS } from '../navigation';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, Avatar],
  templateUrl: './shell.html',
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly navItems = NAV_ITEMS;
  protected readonly displayName = this.auth.displayName;
  protected readonly account = this.auth.account;

  protected readonly sidebarOpen = signal(false);
  protected readonly userMenuOpen = signal(false);

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
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
