'use client';

import React, { createContext, useContext, useEffect, ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '@/api/systemApi';
import { BrandTheme } from '@/types/system';
import { MantineProvider, createTheme, MantineColorsTuple } from '@mantine/core';
import { generateColors } from '@mantine/colors-generator';

interface ThemeContextType {
  activeTheme: BrandTheme | null;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ activeTheme: null, isLoading: false });

export const useBrandTheme = () => useContext(ThemeContext);

export const BrandThemeProvider = ({ children }: { children: ReactNode }) => {
  const { data: themes = [], isLoading } = useQuery<BrandTheme[]>({
    queryKey: ['themes'],
    queryFn: systemApi.getBrandThemes,
  });

  const activeTheme = themes[0] || null;

  // 1. Generate primary color shades (10 levels) for Mantine
  const brandColors = useMemo<MantineColorsTuple>(() => {
    const primary = activeTheme?.primary_color || '#FF6B00';
    return generateColors(primary) as unknown as MantineColorsTuple;
  }, [activeTheme]);

  // 2. Create the dynamic Mantine theme object
  const dynamicTheme = useMemo(() => createTheme({
    fontFamily: activeTheme?.font_family || 'var(--font-be-vietnam), sans-serif',
    headings: {
      fontFamily: activeTheme?.font_family || 'var(--font-be-vietnam), sans-serif',
      fontWeight: '800',
    },
    colors: {
      brand: brandColors,
    },
    primaryColor: 'brand',
    defaultRadius: 'md',
  }), [activeTheme, brandColors]);

  useEffect(() => {
    if (activeTheme) {
      const root = document.documentElement;
      const primary = activeTheme.primary_color || '#FF6B00';
      root.style.setProperty('--brand-primary', primary);
      root.style.setProperty('--brand-primary-soft', `${primary}1A`); // 1A is ~10% opacity in hex
      root.style.setProperty('--brand-secondary', activeTheme.secondary_color || '#FF8533');
      root.style.setProperty('--brand-font', activeTheme.font_family || 'Be Vietnam Pro');
      
      // Update Title & Favicon
      if (activeTheme.brand_name) {
        document.title = `${activeTheme.brand_name} | Admin Dashboard`;
      }
      
      if (activeTheme.logo_url) {
        let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.head.appendChild(favicon);
        }
        favicon.href = activeTheme.logo_url;
      }

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', primary);
      }
    }
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, isLoading }}>
      <MantineProvider theme={dynamicTheme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
};
