'use client';

import React from 'react';
import { Modal, Text, Group, Stack, Box, Button, rem, ThemeIcon } from '@mantine/core';
import { AlertCircle, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBrandTheme } from '@/providers/BrandThemeProvider';

type ConfirmType = 'danger' | 'warning' | 'info' | 'success';

interface AppConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ConfirmType;
  loading?: boolean;
}

export const AppConfirmModal = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Bỏ qua',
  type = 'warning',
  loading = false
}: AppConfirmModalProps) => {
  const { activeTheme } = useBrandTheme();
  const primaryColor = activeTheme?.primary_color || '#FF6B00';

  const getTypeSpecs = () => {
    switch (type) {
      case 'danger':
        return { color: '#EF4444', icon: <AlertCircle size={24} /> };
      case 'warning':
        return { color: '#F59E0B', icon: <AlertTriangle size={24} /> };
      case 'success':
        return { color: '#10B981', icon: <CheckCircle2 size={24} /> };
      default:
        return { color: 'var(--brand-primary)', icon: <HelpCircle size={24} /> };
    }
  };

  const { color, icon } = getTypeSpecs();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered={false}
      yOffset="8vh"
      size="380px"
      withCloseButton={false}
      radius="24px"
      padding="xl"
      overlayProps={{
        backgroundOpacity: 0.01,
        blur: 0,
      }}
      styles={{
        content: { 
          border: `1px solid #e2e8f0`, 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)' 
        }
      }}
    >
      <Stack align="center" gap="md">
        <ThemeIcon 
          size={56} 
          radius="xl" 
          variant="light" 
          style={{ 
            backgroundColor: 'var(--brand-primary-soft)', 
            color: color 
          }}
        >
          {icon}
        </ThemeIcon>

        <Stack gap={4} align="center">
          <Text fw={900} size="lg" ta="center" style={{ letterSpacing: '-0.3px' }}>
            {title}
          </Text>
          <Text size="sm" c="dimmed" ta="center" px="xs">
            {message}
          </Text>
        </Stack>

        <Group grow style={{ width: '100%' }} mt="md">
          <Button 
            variant="subtle" 
            color="gray" 
            onClick={onClose} 
            radius="xl" 
            h={44}
            fw={700}
          >
            {cancelLabel}
          </Button>
          <Button 
            onClick={onConfirm} 
            loading={loading}
            style={{ 
              backgroundColor: type === 'danger' ? '#EF4444' : 'var(--brand-primary)',
              color: 'white',
              boxShadow: `0 8px 20px -6px ${type === 'danger' ? '#EF444488' : 'var(--brand-primary-soft)'}`
            }}
            radius="xl" 
            h={44}
            fw={900}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
