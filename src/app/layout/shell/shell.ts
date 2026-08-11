import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { injectT } from '../../core/i18n/translate';
import { GlobalSearch } from '../global-search/global-search';
import { LayoutStore } from '../layout.store';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidebar, Topbar, GlobalSearch],
  templateUrl: './shell.html',
})
export class Shell {
  private readonly layout = inject(LayoutStore);

  protected readonly t = injectT();
  protected readonly drawerOpen = this.layout.sidebarDrawerOpen;

  protected closeDrawer(): void {
    this.layout.closeDrawer();
  }
}
