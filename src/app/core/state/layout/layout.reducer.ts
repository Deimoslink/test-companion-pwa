import {createReducer, on} from '@ngrx/store';
import {initialLayoutState} from './layout.state';
import {LayoutActions} from './layout.actions';

export const layoutReducer = createReducer(
  initialLayoutState,
  on(LayoutActions.setTitle, (state, { title }) => ({
    ...state,
    title
  }))
);
