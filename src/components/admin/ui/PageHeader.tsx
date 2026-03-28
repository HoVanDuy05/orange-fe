import React from 'react';
import { Text, Group, Breadcrumbs, Anchor, Stack, Box } from '@mantine/core';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AppTitle } from '@/components/common/AppTitle';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export const PageHeader = ({ title, description, actions, breadcrumbs }: PageHeaderProps) => {
  return (
    <Stack gap="xs" mb="xl">
      {/* Breadcrumbs removed as per user request */}


      <Group justify="space-between" align="flex-end" wrap="nowrap">
        <Box>
          <AppTitle level={2}>
            {title}
          </AppTitle>
          {description && (
            <Text c="dimmed" size="sm" mt={4} fw={500}>
              {description}
            </Text>
          )}
        </Box>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </Stack>
  );
};
