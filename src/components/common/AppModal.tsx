'use client';

import React from 'react';
import { Modal, Text, Group, Stack, Box, ScrollArea, Divider, ActionIcon } from '@mantine/core';
import { X } from 'lucide-react';

interface AppModalProps {
  opened: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: string | number;
  loading?: boolean;
  centered?: boolean;
}

import { useBrandTheme } from '@/providers/BrandThemeProvider';

/**
 * Premium AppModal component with sticky header and footer.
 */
export const AppModal = ({
  opened,
  onClose,
  title,
  subtitle,
  children,
  actions,
  size = 'lg',
  centered = true
}: AppModalProps) => {
  const { activeTheme } = useBrandTheme();
  
  const primaryColor = activeTheme?.primary_color || '#FF6B00';
  const secondaryColor = activeTheme?.secondary_color || '#FF8533';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={size}
      centered={centered}
      withCloseButton={false}
      radius="28px"
      padding={0}
      overlayProps={{
        backgroundOpacity: 0.01,
        blur: 0,
      }}
      styles={{
        content: { 
          overflow: 'hidden', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)' 
        },
        body: { padding: 0 }
      }}
    >
      <Stack gap={0} style={{ position: 'relative', maxHeight: '90vh' }}>
        {/* --- HEADER --- */}
        <Box 
          px="xl" py="lg" 
          style={{ 
            background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)`,
            color: 'white',
            position: 'relative'
          }}
        >
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={2}>
              <Text fw={900} size="xl" style={{ letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                {title}
              </Text>
              {subtitle && (
                <Text size="xs" fw={500} style={{ opacity: 0.9 }}>
                  {subtitle}
                </Text>
              )}
            </Stack>
            <ActionIcon 
              variant="white" 
              style={{ color: 'var(--brand-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              onClick={onClose} 
              radius="xl" 
              size="lg"
            >
              <X size={18} />
            </ActionIcon>
          </Group>
        </Box>

        {/* --- CONTENT (Scrollable) --- */}
        <ScrollArea.Autosize mah="calc(90vh - 160px)" p="xl">
          <Box pb="md">
            {children}
          </Box>
        </ScrollArea.Autosize>

        {/* --- FOOTER (Actions) --- */}
        {actions && (
          <>
            <Divider color="slate.1" />
            <Box px="xl" py="lg" bg="slate.0">
              <Group justify="flex-end" gap="md">
                {actions}
              </Group>
            </Box>
          </>
        )}
      </Stack>
    </Modal>
  );
};
