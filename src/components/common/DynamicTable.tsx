import React, { useState, useMemo } from 'react';
import { Table, Text, Box, Group, ScrollArea, TextInput, ActionIcon, Stack, UnstyledButton } from '@mantine/core';
import { ChevronUp, ChevronDown, Search, ArrowUpDown } from 'lucide-react';

export type ColumnType = 'text' | 'number' | 'price' | 'date' | 'action' | 'custom';

export interface TableColumn<T> {
  key: Extract<keyof T, string> | string;
  label: string;
  type?: ColumnType;
  width?: string | number;
  sortable?: boolean;
  filter?: boolean;
  fixed?: boolean;
  render?: (record: T, index: number) => React.ReactNode;
}

interface DynamicTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
}

export function DynamicTable<T extends { id: string | number }>({
  columns,
  data,
  loading
}: DynamicTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [reverseSort, setReverseSort] = useState(false);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setReverseSort(!reverseSort);
    } else {
      setSortKey(key);
      setReverseSort(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setSearchQueries(prev => ({ ...prev, [key]: value }));
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter
    Object.keys(searchQueries).forEach((key) => {
      const query = searchQueries[key].toLowerCase();
      if (query) {
        result = result.filter((item) => {
          const val = (item as any)[key];
          return String(val || '').toLowerCase().includes(query);
        });
      }
    });

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const valA = (a as any)[sortKey];
        const valB = (b as any)[sortKey];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return reverseSort ? valB - valA : valA - valB;
        }

        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        return reverseSort ? strB.localeCompare(strA) : strA.localeCompare(strB);
      });
    }

    return result;
  }, [data, sortKey, reverseSort, searchQueries]);

  const getAlignment = (type?: ColumnType) => {
    switch (type) {
      default:
        return 'center' as const;
    }
  };

  return (
    <ScrollArea h={600} offsetScrollbars scrollbarSize={8}>
      <Table
        verticalSpacing="md"
        horizontalSpacing="lg"
        striped
        highlightOnHover
        withColumnBorders={false}
        stickyHeader
        stickyHeaderOffset={0}
        style={{ minWidth: columns.length > 6 ? 1200 : 'auto' }}
      >
        <Table.Thead style={{ zIndex: 20 }}>
          <Table.Tr>
            {columns.map((col) => {
              const isFixed = col.fixed;
              const align = getAlignment(col.type);

              return (
                <Table.Th
                  key={String(col.key)}
                  w={col.width}
                  style={{
                    backgroundColor: 'white',
                    zIndex: isFixed ? 30 : 10,
                    position: isFixed ? 'sticky' : 'relative',
                    left: isFixed ? 0 : undefined,
                  }}
                  className="border-b-2 border-slate-100"
                >
                  <Stack gap={4}>
                    <Group gap={4} justify="center" wrap="nowrap">
                      {col.sortable ? (
                        <UnstyledButton onClick={() => handleSort(String(col.key))} style={{ width: '100%' }}>
                          <Group gap={4} justify="center" wrap="nowrap">
                            <Text fw={800} size="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                              {col.label}
                            </Text>
                            {sortKey === col.key ? (
                              reverseSort ? <ChevronDown size={14} color="#FF6B00" /> : <ChevronUp size={14} color="#FF6B00" />
                            ) : (
                              <ArrowUpDown size={12} color="#CBD5E1" />
                            )}
                          </Group>
                        </UnstyledButton>
                      ) : (
                        <Text fw={800} size="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          {col.label}
                        </Text>
                      )}
                    </Group>

                    {col.filter && (
                      <TextInput
                        placeholder="Lọc..."
                        size="xs"
                        leftSection={<Search size={10} />}
                        value={searchQueries[String(col.key)] || ''}
                        onChange={(e) => handleFilterChange(String(col.key), e.currentTarget.value)}
                        styles={{ input: { height: 24, fontSize: 10, borderRadius: 6 } }}
                      />
                    )}
                  </Stack>
                </Table.Th>
              );
            })}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredAndSortedData.length === 0 && !loading ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length} className="text-center py-24">
                <Stack align="center" gap={4}>
                  <Search size={32} color="#E2E8F0" />
                  <Text c="dimmed" fs="italic" fw={500} size="sm">Không tìm thấy dữ liệu phù hợp...</Text>
                </Stack>
              </Table.Td>
            </Table.Tr>
          ) : (
            filteredAndSortedData.map((record, index) => (
              <Table.Tr key={record.id} className="hover:bg-orange-50/30 transition-colors">
                {columns.map((col) => {
                  const align = getAlignment(col.type);
                  const isFixed = col.fixed;

                  return (
                    <Table.Td
                      key={`${record.id}-${String(col.key)}`}
                      ta={align}
                      style={{ 
                        verticalAlign: 'middle', 
                        borderBottomColor: '#F8FAFC',
                        position: isFixed ? 'sticky' : undefined,
                        left: isFixed ? 0 : undefined,
                        backgroundColor: isFixed ? 'white' : undefined,
                        zIndex: isFixed ? 5 : undefined,
                        boxShadow: isFixed ? '4px 0 8px rgba(0,0,0,0.02)' : undefined
                      }}
                    >
                      {col.render ? (
                        col.render(record, index)
                      ) : (
                        <Text size="sm" fw={col.type === 'price' ? 700 : 500} c={col.type === 'price' ? 'red' : 'gray.8'}>
                          {(record as any)[col.key]}
                        </Text>
                      )}
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
