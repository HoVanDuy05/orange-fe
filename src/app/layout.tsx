import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';

import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import QueryProvider from '@/providers/QueryProvider';

import './globals.css';

const beVietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam',
});

export const metadata: Metadata = {
  title: 'IUH Admin Dashboard',
  description: 'Hệ thống Quản trị Nhà hàng Chuyên nghiệp',
};

const theme = createTheme({
  fontFamily: 'var(--font-be-vietnam), sans-serif',
  headings: {
    fontFamily: 'var(--font-be-vietnam), sans-serif',
    fontWeight: '800',
  },
  primaryColor: 'blue',
  defaultRadius: 'md',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnam.className} suppressHydrationWarning>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <Notifications position="top-right" zIndex={2000} />
            <ModalsProvider>
              {children}
            </ModalsProvider>
          </MantineProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
