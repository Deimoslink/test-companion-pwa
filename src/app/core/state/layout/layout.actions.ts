import { createActionGroup, props } from '@ngrx/store';

export const LayoutActions = createActionGroup({
  source: 'Layout',
  events: {
    'Page Opened': props<{ title: string }>(),
    'Set Title': props<{ title: string }>(),
  }
});
