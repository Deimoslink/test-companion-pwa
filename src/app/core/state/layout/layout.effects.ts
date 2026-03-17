import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LayoutActions } from './layout.actions';
import { map, observeOn } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';

@Injectable()
export class LayoutEffects {
  private actions$ = inject(Actions);

  updateTitle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LayoutActions.pageOpened),
      // Мы просто пробрасываем данные дальше.
      // Сам факт прохода через эффект делает операцию безопасной для Angular
      map(({ title }) => LayoutActions.setTitle({ title }))
    )
  );
}
