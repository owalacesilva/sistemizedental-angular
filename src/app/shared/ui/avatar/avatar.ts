import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Deterministic palette so the same person always gets the same tile. */
const TILES = [
  'bg-brand-600 text-white',
  'bg-brand-400 text-brand-950',
  'bg-brand-900 text-brand-100',
  'bg-brand-200 text-brand-900',
  'bg-brand-700 text-white',
];

@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none"
      [class]="sizeClass() + ' ' + tileClass()"
      [attr.title]="name()"
      [attr.aria-label]="name()"
      role="img"
    >
      {{ initials() }}
    </span>
  `,
})
export class Avatar {
  readonly name = input.required<string>();
  readonly sizeClass = input('h-9 w-9 text-xs');

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return '?';
    }
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (first + last).toUpperCase();
  });

  protected readonly tileClass = computed(() => {
    const name = this.name();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) % 997;
    }
    return TILES[hash % TILES.length];
  });
}
