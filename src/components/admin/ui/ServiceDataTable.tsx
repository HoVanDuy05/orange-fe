import React from 'react';
import { Table, Card, Text, LoadingOverlay, ScrollArea, Box, Center, Stack } from '@mantine/core';
import { Inbox } from 'lucide-react';

interface DataTableProps<T> {
  columns: { 
    key: string; 
    label: string; 
    width?: string | number;
    align?: 'left' | 'center' | 'right';
  }[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  renderRow?: (item: T, index: number) => React.ReactNode;
}

export const ServiceDataTable = <T extends Record<string, any>>({ 
  columns, data, isLoading, emptyMessage = 'Chưa có bản ghi nào.', renderRow 
}: DataTableProps<T>) => {
  return (
    <Card 
      withBorder 
      radius="xl" 
      shadow="xs" 
      p="0" 
      style={{ 
        position: 'relative', 
        background: 'white', 
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}
    >
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: 'xl', blur: 2 }} loaderProps={{ color: 'brand' }} />
      <ScrollArea h={600} offsetScrollbars>
        <Table verticalSpacing="sm" horizontalSpacing="xl" highlightOnHover striped withColumnBorders={false}>
          <Table.Thead 
            style={{ 
              background: '#F1F5F9', 
              position: 'sticky', 
              top: 0, 
              zIndex: 10,
              borderBottom: '2px solid #E2E8F0'
            }}
          >
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th 
                  key={col.key} 
                  style={{ 
                    width: col.width, 
                    borderBottom: '1px solid #E2E8F0',
                    textAlign: col.align || 'center'
                  }}
                >
                  <Text size="xs" fw={900} tt="uppercase" c="gray.8" style={{ letterSpacing: '0.08em' }}>
                    {col.label}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.length === 0 && !isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length} p="xl" style={{ textAlign: 'center' }}>
                  <Center h={100}>
                    <Stack align="center" gap="xs">
                       <Box style={{ color: '#94A3B8' }}><Inbox size={32} /></Box>
                       <Text size="sm" c="dimmed" fw={600}>{emptyMessage}</Text>
                    </Stack>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((item, index) => (
                renderRow ? renderRow(item, index) : (
                  <Table.Tr key={index}>
                    {columns.map((col) => (
                      <Table.Td key={col.key} style={{ textAlign: col.align || 'center' }}>
                        <Text size="sm" fw={600} style={{ color: '#334155' }}>
                          {(item as any)[col.key] || '-'}
                        </Text>
                      </Table.Td>
                    ))}
                  </Table.Tr>
                )
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
};
