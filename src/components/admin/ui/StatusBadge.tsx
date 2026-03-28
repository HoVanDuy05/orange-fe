import React from 'react';
import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'table' | 'payment';
}

const statusMap: Record<string, { label: string; color: string }> = {
  // Order statuses
  pending:    { label: 'Chờ duyệt',    color: 'gray' },
  confirmed:  { label: 'Đã xác nhận',  color: 'blue' },
  preparing:  { label: 'Đang pha chế', color: 'brand' },
  delivering: { label: 'Đang giao',    color: 'yellow' },
  served:     { label: 'Đã phục vụ',   color: 'teal' },
  completed:  { label: 'Hoàn tất',     color: 'green' },
  cancelled:  { label: 'Đã hủy',       color: 'red' },

  // Table statuses (dynamic)
  occupied:   { label: 'Đang ngồi',   color: 'red' },
  available:  { label: 'Bàn trống',   color: 'green' },

  // Payment statuses
  success:    { label: 'Đã thanh toán', color: 'green' },
  waiting:    { label: 'Chờ thanh toán', color: 'brand' },
  failed:     { label: 'Lỗi giao dịch',  color: 'red' },
};

export const StatusBadge = ({ status, type = 'order' }: StatusBadgeProps) => {
  const config = statusMap[status.toLowerCase()] || { label: status, color: 'gray' };
  
  return (
    <Badge 
      variant="light" 
      color={config.color} 
      size="sm" 
      radius="md" 
      fw={800} 
      styles={{ 
        root: { 
          textTransform: 'none', 
          height: 22,
          padding: '0 10px',
        } 
      }}
    >
      {config.label}
    </Badge>
  );
};
