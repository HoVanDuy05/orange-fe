import React from 'react';
import { Table, Text, Box, Group, ScrollArea } from '@mantine/core';

export type ColumnType = 'text' | 'number' | 'price' | 'date' | 'action' | 'custom';

export interface TableColumn<T> {
  key: string;
  label: string;
  type?: ColumnType;
  width?: string | number;
  render?: (record: T, index: number) => React.ReactNode;
}

interface DynamicTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
}

/**
 * Thành phần Bảng Động (DynamicTable) dùng chung cho dự án
 * Tự động căn lề theo loại dữ liệu:
 * - Header: Căn giữa, in đậm
 * - Text: Căn trái
 * - Price/Number: Căn phải
 * - Date/Action: Căn giữa
 */
export function DynamicTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  loading 
}: DynamicTableProps<T>) {

  const getAlignment = (type?: ColumnType) => {
    switch (type) {
      case 'price':
      case 'number':
        return 'right';
      case 'date':
      case 'action':
        return 'center';
      default:
        return 'left';
    };
  };

  return (
    <ScrollArea>
      <Table 
        verticalSpacing="md" 
        horizontalSpacing="lg" 
        striped 
        highlightOnHover 
        withColumnBorders={false}
      >
        <Table.Thead className="bg-slate-50">
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th 
                key={col.key} 
                className="text-center font-bold text-blue-900 border-b-2 border-slate-200"
                w={col.width}
              >
                <Text fw={800} size="sm" ta="center" tt="uppercase" className="tracking-wider">
                  {col.label}
                </Text>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.length === 0 && !loading ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length} className="text-center py-10">
                <Text c="dimmed" fs="italic">Chưa có dữ liệu hiển thị...</Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((record, index) => (
              <Table.Tr key={record.id} className="hover:bg-blue-50/20 transition-colors">
                {columns.map((col) => {
                  const align = getAlignment(col.type);
                  return (
                    <Table.Td 
                      key={`${record.id}-${col.key}`} 
                      ta={align}
                      style={{ verticalAlign: 'middle' }}
                    >
                      {col.render ? (
                         col.render(record, index)
                      ) : (
                        <Text size="sm" fw={col.type === 'price' ? 700 : 500}>
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
