import type { ComponentProps } from 'react';
import type { Href } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type PublicNavItem = {
  label: string;
  description?: string;
  href: Href;
  icon: ComponentProps<typeof MaterialIcons>['name'];
};

export const PUBLIC_NAV_ITEMS = [
  {
    label: 'Home',
    href: '/(public)',
    icon: 'home',
  },
  {
    label: 'About',
    href: '/(public)/about',
    icon: 'info',
  },
  {
    label: 'Contact',
    href: '/(public)/contact',
    icon: 'mail',
  },
  {
    label: 'Services',
    href: '/(public)/services',
    icon: 'business',
  },
] as const satisfies ReadonlyArray<PublicNavItem>;

