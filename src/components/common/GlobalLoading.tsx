import { Center, Box, Text, Image, Stack, Transition } from '@mantine/core';
import React from 'react';
import { useBrandTheme } from '@/providers/BrandThemeProvider';

const PremiumLoader = ({ size = 100, logoUrl, primaryColor }: { size?: number, logoUrl?: string | null, primaryColor: string }) => (
  <Box style={{ position: 'relative', width: size * 1.5, height: size * 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {/* Background Glow */}
    <Box 
      style={{
        position: 'absolute',
        width: size * 1.2,
        height: size * 1.2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${primaryColor}22 0%, transparent 70%)`,
        animation: 'glow-pulse 3s ease-in-out infinite'
      }} 
    />

    {/* Multiple rotating rings */}
    <Box 
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '1px solid transparent',
        borderTop: `2px solid ${primaryColor}`,
        borderBottom: `2px solid ${primaryColor}44`,
        animation: 'spin 1.5s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite'
      }} 
    />
    <Box 
      style={{
        position: 'absolute',
        inset: 10,
        borderRadius: '50%',
        border: '1px solid transparent',
        borderLeft: `1px solid ${primaryColor}66`,
        borderRight: `1px solid ${primaryColor}66`,
        animation: 'spin 2s linear infinite reverse'
      }} 
    />

    {/* Logo with breath effect */}
    <Box style={{ animation: 'breath 2.5s ease-in-out infinite', zIndex: 2 }}>
      <Image 
        src={logoUrl || "/orange-logo.png"} 
        alt="Brand" 
        style={{ 
          width: size * 0.7, 
          height: size * 0.7, 
          objectFit: 'contain',
          filter: `drop-shadow(0 0 10px ${primaryColor}33)`
        }} 
      />
    </Box>

    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes glow-pulse {
        0%, 100% { transform: scale(0.8); opacity: 0.3; }
        50% { transform: scale(1.1); opacity: 0.6; }
      }
      @keyframes breath {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px ${primaryColor}22); }
        50% { transform: scale(1.08); filter: drop-shadow(0 0 15px ${primaryColor}55); }
      }
      @keyframes tracking-in {
        0% { letter-spacing: -0.5em; opacity: 0; }
        40% { opacity: 0.6; }
        100% { opacity: 1; }
      }
    `}</style>
  </Box>
);

export const GlobalLoading = ({ visible }: { visible: boolean }) => {
  const { activeTheme } = useBrandTheme();
  const primaryColor = activeTheme?.primary_color || '#FF6B00';
  
  return (
    <Transition mounted={visible} transition="fade" duration={400} timingFunction="ease">
      {(styles) => (
        <Box 
          style={{ 
            ...styles,
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999, 
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Stack align="center" gap="xl">
            <PremiumLoader logoUrl={activeTheme?.logo_url} primaryColor={primaryColor} />
            <Stack gap={4} align="center">
               <Text 
                 fw={900} 
                 size="xl" 
                 style={{ 
                   color: '#1e293b', 
                   letterSpacing: '8px', 
                   textTransform: 'uppercase',
                   animation: 'tracking-in 1.5s cubic-bezier(0.215, 0.610, 0.355, 1.000) both' 
                 }}
               >
                  ORANGE CAFE
               </Text>
               <Box 
                 style={{ 
                   height: 2, 
                   width: 40, 
                   backgroundColor: primaryColor,
                   borderRadius: 1,
                   animation: 'glow-pulse 2s infinite' 
                 }} 
               />
               <Text size="xs" fw={700} c="dimmed" style={{ letterSpacing: '2px', marginTop: 8 }}>HỆ THỐNG ĐANG XỬ LÝ...</Text>
            </Stack>
          </Stack>
        </Box>
      )}
    </Transition>
  );
};

export const SectionLoader = () => {
  const { activeTheme } = useBrandTheme();
  const primaryColor = activeTheme?.primary_color || '#FF6B00';
  
  return (
    <Center h={280} w="100%">
      <Stack align="center" gap="lg">
        <PremiumLoader size={60} logoUrl={activeTheme?.logo_url} primaryColor={primaryColor} />
        <Text size="xs" fw={800} c="dimmed" style={{ letterSpacing: '3px', textTransform: 'uppercase' }}>
          Đang tải dữ liệu
        </Text>
      </Stack>
    </Center>
  );
};

export const FullPageLoader = () => <GlobalLoading visible={true} />;
