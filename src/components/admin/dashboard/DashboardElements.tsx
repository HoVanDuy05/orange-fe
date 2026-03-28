import React from 'react';
import { Card, Group, Text, Box, Progress } from '@mantine/core';
import { ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
}

export const StatCard = ({ label, value, sub, color }: StatCardProps) => {
  return (
    <Card 
      withBorder 
      radius="xl" 
      shadow="xs" 
      p="lg" 
      style={{ 
        background: 'white',
        transition: 'transform 0.2s ease',
      }}
      className="hover:scale-[1.01]"
    >
      <Group justify="space-between" mb={4}>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">{label}</Text>
        <Box style={{ color, background: `${color}10`, borderRadius: '50%', padding: 4, display: 'flex' }}>
          <ArrowUpRight size={14} />
        </Box>
      </Group>
      <Text fw={800} size="24px" style={{ color: '#111827', letterSpacing: '-0.03em' }}>{value}</Text>
      <Text size="xs" c="dimmed" mt={2}>{sub}</Text>
    </Card>
  );
};

interface ChannelBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export const ChannelBar = ({ label, value, total, color, icon }: ChannelBarProps) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box mt="md">
      <Group justify="space-between" mb={4} wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <Box style={{ color, background: `${color}15`, borderRadius: 6, padding: 4, display: 'flex' }}>
            {icon}
          </Box>
          <Text size="sm" fw={600} c="dimmed">{label}</Text>
        </Group>
        <Group gap={6} wrap="nowrap">
          <Text size="xs" c="dimmed" fw={700}>{pct}%</Text>
          <Text size="sm" fw={800} style={{ color: '#1F2937' }}>{fmt(value)}</Text>
        </Group>
      </Group>
      <Progress value={pct} color={Object.keys(colors).includes(color) ? color : undefined} style={{ background: `${color}10` }} styles={{ section: { background: color } }} size="sm" radius="xl" />
    </Box>
  );
};

// Generic type-safe colors map in case color name is passed instead of hex
const colors: any = {
  orange: '#FF6B00',
  teal: '#10B981',
  indigo: '#6366F1',
  amber: '#F59E0B',
};
