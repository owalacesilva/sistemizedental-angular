import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { injectT } from '../../core/i18n/translate';
import { injectCurrentUrl } from '../../shared/router/current-url';
import { Logo } from '../../shared/ui/logo/logo';
import { LayoutStore } from '../layout.store';
import { NAV_ITEMS, isUnderRoute, type NavItem } from '../navigation';

/**
 * Primary navigation.
 *
 * Sections with more than one screen unfold in place rather than growing an
 * in-page tab bar: the sidebar has room to spare, and a tab strip costs the
 * content area a row it never gets back. Collapsed to a rail the groups still
 * work — clicking one widens the sidebar and opens it, so a section is never
 * more than a click from view.
 */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Logo],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly layout = inject(LayoutStore);
  private readonly url = injectCurrentUrl();

  protected readonly t = injectT();
  protected readonly navItems = NAV_ITEMS;
  protected readonly collapsed = this.layout.sidebarCollapsed;
  protected readonly drawerOpen = this.layout.sidebarDrawerOpen;

  /** The section the current URL sits in, or `null` outside every group. */
  private readonly activeGroup = computed(() => {
    const url = this.url();
    return (
      this.navItems.find((item) => item.children?.length && isUnderRoute(url, item.route))?.route ??
      null
    );
  });

  /**
   * Navigating into a section unfolds it and leaves earlier choices alone;
   * `linkedSignal` gives us that "recompute from the route, but keep what the
   * user did" behaviour without an effect writing to a signal.
   */
  private readonly openGroups = linkedSignal<string | null, ReadonlySet<string>>({
    source: () => this.activeGroup(),
    computation: (group, previous) => {
      const next = new Set(previous?.value ?? []);
      if (group) {
        next.add(group);
      }
      return next;
    },
  });

  protected isGroupOpen(item: NavItem): boolean {
    return this.openGroups().has(item.route);
  }

  protected isSectionActive(item: NavItem): boolean {
    return isUnderRoute(this.url(), item.route);
  }

  /** Rail mode has no room for children, so the parent carries the highlight. */
  protected groupClass(item: NavItem): string {
    if (!this.isSectionActive(item)) {
      return '';
    }
    return this.collapsed() ? 'app-nav-link-active' : 'bg-brand-800/70 text-white';
  }

  protected toggleGroup(item: NavItem): void {
    if (this.collapsed()) {
      this.layout.expandSidebar();
      this.openGroups.update((open) => new Set(open).add(item.route));
      return;
    }

    this.openGroups.update((open) => {
      const next = new Set(open);
      if (!next.delete(item.route)) {
        next.add(item.route);
      }
      return next;
    });
  }

  protected toggleCollapsed(): void {
    this.layout.toggleSidebarCollapsed();
  }

  protected closeDrawer(): void {
    this.layout.closeDrawer();
  }
}
