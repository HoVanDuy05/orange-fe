'use client';

import { POSProvider } from './POSContext';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <POSProvider>
      <div style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {children}
      </div>
    </POSProvider>
  );
}
