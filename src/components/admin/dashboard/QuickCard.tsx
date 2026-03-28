import React from 'react';
import { Card, Group, Text, Box, Skeleton, Stack } from '@mantine/core';

interface QuickCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
  loading?: boolean;
  isCount?: boolean;
}

export const QuickCard = ({ label, value, icon, color, sub, loading, isCount }: QuickCardProps) => {
  return (
    <Card
      withBorder
      radius="xl"
      shadow="xs"
      p="lg"
      style={{
        background: 'white',
        borderTop: `3px solid ${color}`,
        transition: 'transform 0.2s ease, shadow 0.2s ease',
      }}
      className="hover:scale-[1.02] hover:shadow-md"
    >
      {loading ? (
        <Stack gap="xs">
          <Skeleton height={20} width="60%" />
          <Skeleton height={32} width="80%" />
          <Skeleton height={14} width="50%" />
        </Stack>
      ) : (
        <>
          <Group justify="space-between" mb="xs" wrap="nowrap">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">{label}</Text>
            <Box style={{
              color,
              background: `${color}15`,
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
          </Group>
          <Text fw={800} size={isCount ? '26px' : '22px'} style={{ color: '#111827', letterSpacing: '-0.02em' }}>
            {value}
          </Text>
          {sub && <Text size="xs" c="dimmed" mt={4}>{sub}</Text>}
        </>
      )}
    </Card>
  );
};
