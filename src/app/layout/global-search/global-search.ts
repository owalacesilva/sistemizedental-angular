import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { I18nService } from '../../core/i18n/i18n.service';
import type { MessageKey } from '../../core/i18n/messages.en';
import { Spinner } from '../../shared/ui/spinner/spinner';
import { LayoutStore } from '../layout.store';
import { NAV_ITEMS } from '../navigation';
import { GlobalSearchService, type SearchGroup, type SearchHit } from './global-search.service';
import { highlight } from './highlight';
import { clearRecentSearches, readRecentSearches, rememberSearch } from './recent-searches';

/** Below this the remote sources stay quiet — two letters match half the clinic. */
const MIN_REMOTE_CHARS = 2;
const SEARCH_DEBOUNCE_MS = 220;

/** A hit plus its position in the flattened list the arrow keys walk. */
interface SearchRow {
  readonly hit: SearchHit;
  readonly index: number;
}

interface SearchSection {
  readonly key: SearchGroup;
  readonly labelKey: MessageKey;
  readonly rows: readonly SearchRow[];
}

const GROUP_LABELS: Record<SearchGroup, MessageKey> = {
  pages: 'search.group.pages',
  patients: 'search.group.patients',
  doctors: 'search.group.doctors',
};

/**
 * Command palette behind ⌘K / Ctrl+K.
 *
 * Destinations are matched locally and appear on the first keystroke; patients
 * and the roster come from the API behind a debounce. The two are merged into
 * one keyboard-navigable list so the remote half arriving never moves the row
 * under the cursor.
 */
@Component({
  selector: 'app-global-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Spinner],
  templateUrl: './global-search.html',
  host: { '(document:keydown)': 'onGlobalKeydown($event)' },
})
export class GlobalSearch {
  private readonly layout = inject(LayoutStore);
  private readonly router = inject(Router);
  private readonly search = inject(GlobalSearchService);
  private readonly i18n = inject(I18nService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly t = this.i18n.t;
  protected readonly open = this.layout.isSearchOpen;
  protected readonly control = new FormControl('', { nonNullable: true });
  protected readonly highlight = highlight;

  /** `⌘K` reads as noise on Windows, and `Ctrl K` as noise on a Mac. */
  protected readonly shortcutHint =
    typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent)
      ? '⌘K'
      : 'Ctrl K';

  /** Immediate, for the empty/idle copy. */
  protected readonly typed = toSignal(
    this.control.valueChanges.pipe(
      map((value) => value.trim()),
      startWith(''),
    ),
    { initialValue: '' },
  );

  /** Debounced, for anything that costs a request. */
  private readonly term = toSignal(
    this.control.valueChanges.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      map((value) => value.trim()),
      distinctUntilChanged(),
      startWith(''),
    ),
    { initialValue: '' },
  );

  protected readonly recents = signal(readRecentSearches());

  private readonly remote = rxResource({
    params: () => {
      const term = this.term();
      return this.open() && term.length >= MIN_REMOTE_CHARS ? term : undefined;
    },
    stream: ({ params }) => this.search.lookup(params),
  });

  protected readonly isLoading = this.remote.isLoading;
  protected readonly hasError = computed(() => this.remote.error() !== undefined);

  /** Destinations, matched against the labels the user can actually see. */
  private readonly pageHits = computed<readonly SearchHit[]>(() => {
    const needle = this.typed().toLowerCase();

    const all = NAV_ITEMS.flatMap((item) => {
      const parent: SearchHit = {
        id: `page-${item.route}`,
        group: 'pages',
        title: this.t(item.labelKey),
        subtitle: this.t(item.descriptionKey),
        route: item.route,
        icon: item.icon,
      };

      const children = (item.children ?? []).map<SearchHit>((child) => ({
        id: `page-${child.route}`,
        group: 'pages',
        title: `${this.t(item.labelKey)} · ${this.t(child.labelKey)}`,
        subtitle: this.t(child.descriptionKey),
        route: child.route,
        icon: item.icon,
      }));

      return [parent, ...children];
    });

    if (!needle) {
      // Nothing typed yet: offer the top level as a jump list.
      return all.filter((hit) => !hit.title.includes('·'));
    }

    return all
      .filter((hit) => `${hit.title} ${hit.subtitle ?? ''}`.toLowerCase().includes(needle))
      .slice(0, 6);
  });

  protected readonly sections = computed<readonly SearchSection[]>(() => {
    const term = this.typed();
    const remote = this.remote.hasValue() ? this.remote.value() : [];

    const patients = remote.filter((hit) => hit.group === 'patients');
    const doctors = remote.filter((hit) => hit.group === 'doctors');

    const withOverflow: readonly SearchHit[] =
      term.length >= MIN_REMOTE_CHARS && patients.length
        ? [
            ...patients,
            {
              id: 'patients-all',
              group: 'patients',
              title: this.t('search.allPatients', { term }),
              subtitle: null,
              route: '/patients',
              queryParams: { search: term },
              icon: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z',
            },
          ]
        : patients;

    const groups: readonly { key: SearchGroup; hits: readonly SearchHit[] }[] = [
      { key: 'pages', hits: this.pageHits() },
      { key: 'patients', hits: withOverflow },
      { key: 'doctors', hits: doctors },
    ];

    // Number the rows across groups: the grouping is visual, the cursor is not.
    let index = 0;
    return groups
      .filter((group) => group.hits.length > 0)
      .map((group) => ({
        key: group.key,
        labelKey: GROUP_LABELS[group.key],
        rows: group.hits.map((hit) => ({ hit, index: index++ })),
      }));
  });

  protected readonly flatHits = computed(() =>
    this.sections().flatMap((section) => section.rows.map((row) => row.hit)),
  );

  /** Reset to the top whenever the result set changes under the cursor. */
  private readonly cursor = linkedSignal<readonly SearchHit[], number>({
    source: () => this.flatHits(),
    computation: () => 0,
  });

  protected readonly activeIndex = computed(() =>
    Math.min(this.cursor(), Math.max(0, this.flatHits().length - 1)),
  );

  protected readonly isEmpty = computed(
    () => !this.isLoading() && this.typed().length > 0 && this.flatHits().length === 0,
  );

  constructor() {
    // Opening should put the caret in the box; selecting lets a second ⌘K retype.
    effect(() => {
      const input = this.searchInput()?.nativeElement;
      if (this.open() && input) {
        input.focus();
        input.select();
      }
    });

    // Keep the keyboard cursor visible when it walks past the fold.
    effect(() => {
      const index = this.activeIndex();
      if (!this.open()) {
        return;
      }

      const row = this.host.nativeElement.querySelector(`[data-hit-index="${index}"]`);

      // Guarded: scrolling is a browser affordance, and jsdom does not have it.
      if (typeof row?.scrollIntoView === 'function') {
        row.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  protected onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();

      if (this.open()) {
        this.close();
      } else {
        this.layout.openSearch();
      }
      return;
    }

    if (this.open() && event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.cursor.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.cursor.set(this.flatHits().length - 1);
        break;
      case 'Enter': {
        event.preventDefault();
        const hit = this.flatHits()[this.activeIndex()];
        if (hit) {
          this.choose(hit);
        }
        break;
      }
    }
  }

  protected choose(hit: SearchHit): void {
    if (hit.group !== 'pages') {
      this.recents.set(rememberSearch(this.typed(), this.recents()));
    }

    void this.router.navigate([hit.route], { queryParams: hit.queryParams ?? {} });
    this.close();
  }

  protected useRecent(term: string): void {
    this.control.setValue(term);
    this.searchInput()?.nativeElement.focus();
  }

  protected clearRecents(): void {
    this.recents.set(clearRecentSearches());
  }

  protected close(): void {
    this.layout.closeSearch();
  }

  /** Pointer and keyboard share one cursor, so hovering never fights the arrows. */
  protected focusRow(index: number): void {
    this.cursor.set(index);
  }

  private move(delta: number): void {
    const count = this.flatHits().length;
    if (!count) {
      return;
    }

    this.cursor.set((this.activeIndex() + delta + count) % count);
  }
}
