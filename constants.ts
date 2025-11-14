import type { EmailStyle } from './types';
import type { IconName } from './components/Icon';

export const STYLE_OPTIONS: { name: EmailStyle; icon: IconName }[] = [
  { name: 'Formal', icon: 'tie' },
  { name: 'Friendly', icon: 'friendly-face' },
  { name: 'Concise', icon: 'bolt' },
  { name: 'Professional', icon: 'briefcase' },
  { name: 'Administrative', icon: 'clipboard' },
];


export const STYLES: EmailStyle[] = ['Formal', 'Friendly', 'Concise', 'Professional', 'Administrative'];