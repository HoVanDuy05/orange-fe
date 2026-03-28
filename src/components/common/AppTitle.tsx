'use client';

import React from 'react';
import { Title, TitleProps, rem } from '@mantine/core';
import { useBrandTheme } from '@/providers/BrandThemeProvider';

interface AppTitleProps extends TitleProps {
  level?: 1 | 2 | 3 | 4 | 5;
  withBrandColor?: boolean;
}

/**
 * Custom Title component that automatically applies brand styles
 * and supports custom levels mapping to Mantine's order prop.
 */
export const AppTitle = ({ 
  level = 1, 
  withBrandColor = true, 
  style, 
  children, 
  ...props 
}: AppTitleProps) => {
  const { activeTheme } = useBrandTheme();
  const primaryColor = activeTheme?.primary_color || 'var(--brand-primary)';

  // Define some nice default stylings for different levels
  const levelStyles: Record<number, any> = {
    1: { fontSize: rem(32), fontWeight: 900, letterSpacing: '-0.04em' },
    2: { fontSize: rem(26), fontWeight: 800, letterSpacing: '-0.03em' },
    3: { fontSize: rem(20), fontWeight: 800, letterSpacing: '-0.02em' },
    4: { fontSize: rem(16), fontWeight: 700, letterSpacing: '-0.01em' },
    5: { fontSize: rem(14), fontWeight: 700, letterSpacing: '0' },
  };

  return (
    <Title
      order={level as any}
      style={{
        color: withBrandColor ? primaryColor : undefined,
        fontFamily: activeTheme?.font_family || 'inherit',
        ...levelStyles[level],
        ...style,
      }}
      {...props}
    >
      {children}
    </Title>
  );
};
