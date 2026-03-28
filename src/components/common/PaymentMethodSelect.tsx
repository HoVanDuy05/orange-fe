import React from 'react';
import { Stack, Text, SimpleGrid, UnstyledButton, ThemeIcon, Box } from '@mantine/core';
import { Banknote, CreditCard, Receipt } from 'lucide-react';

export type PaymentMethod = 'cash' | 'transfer';

interface PaymentMethodSelectProps {
  value: PaymentMethod | null;
  onChange: (value: PaymentMethod) => void;
  label?: string;
  withLabel?: boolean;
}

export const PaymentMethodSelect = ({ 
  value, 
  onChange, 
  label = 'Hình thức thanh toán:', 
  withLabel = true 
}: PaymentMethodSelectProps) => {
  return (
    <Stack gap="sm">
      {withLabel && (
        <Text size="xs" fw={800} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
          {label}
        </Text>
      )}
      <SimpleGrid cols={2} spacing="md">
        {/* Cash Option */}
        <UnstyledButton
          onClick={() => onChange('cash')}
          style={{
            padding: '20px 16px',
            borderRadius: '20px',
            border: '2px solid',
            borderColor: value === 'cash' ? 'var(--brand-primary)' : '#F1F5F9',
            background: value === 'cash' ? 'var(--brand-primary-soft)' : 'white',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: value === 'cash' ? '0 10px 15px -3px rgba(255, 107, 0, 0.1)' : 'none',
            transform: value === 'cash' ? 'translateY(-2px)' : 'none'
          }}
        >
          <Stack align="center" gap="sm">
            <ThemeIcon
              size={48}
              radius="xl"
              variant={value === 'cash' ? 'filled' : 'light'}
              color={value === 'cash' ? 'brand' : 'gray'}
            >
              <Banknote size={24} />
            </ThemeIcon>
            <Text ta="center" fw={value === 'cash' ? 900 : 700} size="sm" c={value === 'cash' ? 'brand.9' : 'gray.7'}>
              Tiền mặt
            </Text>
          </Stack>
        </UnstyledButton>

        {/* Transfer Option */}
        <UnstyledButton
          onClick={() => onChange('transfer')}
          style={{
            padding: '20px 16px',
            borderRadius: '20px',
            border: '2px solid',
            borderColor: value === 'transfer' ? 'var(--brand-primary)' : '#F1F5F9',
            background: value === 'transfer' ? 'var(--brand-primary-soft)' : 'white',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: value === 'transfer' ? '0 10px 15px -3px rgba(255, 107, 0, 0.1)' : 'none',
            transform: value === 'transfer' ? 'translateY(-2px)' : 'none'
          }}
        >
          <Stack align="center" gap="sm">
            <ThemeIcon
              size={48}
              radius="xl"
              variant={value === 'transfer' ? 'filled' : 'light'}
              color={value === 'transfer' ? 'brand' : 'gray'}
            >
              <CreditCard size={24} />
            </ThemeIcon>
            <Text ta="center" fw={value === 'transfer' ? 900 : 700} size="sm" c={value === 'transfer' ? 'brand.9' : 'gray.7'}>
              Chuyển khoản
            </Text>
          </Stack>
        </UnstyledButton>
      </SimpleGrid>
    </Stack>
  );
};
