export interface LayoutState {
  title: string;
  isMenuOpen: boolean;
  theme: 'light' | 'dark';
}

export const initialLayoutState: LayoutState = {
  title: '',
  isMenuOpen: false,
  theme: 'light'
};
