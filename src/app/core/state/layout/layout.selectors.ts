import {createFeatureSelector, createSelector} from '@ngrx/store';
import {LayoutState} from '@state/layout/layout.state';


// 1. Указываем на ветку 'layout' в сторе
export const selectLayoutState = createFeatureSelector<LayoutState>('layout');

// 2. Достаем конкретно заголовок
export const selectTitle = createSelector(
  selectLayoutState,
  (state: LayoutState) => state.title
);
