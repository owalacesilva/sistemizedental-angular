import { Injectable, signal } from '@angular/core';

/** Namespaced so it never collides with the legacy `acc_*` keys. */
const STORAGE_KEY = 'app_sidebar';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, collapsed ? 'collapsed' : 'expanded');
  } catch {
    // The preference simply will not survive a reload.
  }
}

/**
 * Chrome state shared by the shell, the sidebar and the topbar.
 *
 * The two sidebar states are deliberately separate: on a phone the sidebar is a
 * drawer that is either over the content or gone, while on a desktop it is
 * always present and only narrows to an icon rail. One flag cannot mean both
 * without the desktop layout jumping every time someone resizes.
 */
@Injectable({ providedIn: 'root' })
export class LayoutStore {
  /** Desktop: the sidebar is narrowed to an icon rail. Persisted. */
  private readonly collapsed = signal(readCollapsed());
  /** Mobile: the sidebar drawer is over the content. Never persisted. */
  private readonly drawerOpen = signal(false);
  private readonly searchOpen = signal(false);

  readonly sidebarCollapsed = this.collapsed.asReadonly();
  readonly sidebarDrawerOpen = this.drawerOpen.asReadonly();
  readonly isSearchOpen = this.searchOpen.asReadonly();

  toggleSidebarCollapsed(): void {
    this.collapsed.update((collapsed) => {
      writeCollapsed(!collapsed);
      return !collapsed;
    });
  }

  expandSidebar(): void {
    if (this.collapsed()) {
      writeCollapsed(false);
      this.collapsed.set(false);
    }
  }

  toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  openSearch(): void {
    this.searchOpen.set(true);
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }
}
