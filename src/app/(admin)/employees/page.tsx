'use client';

import React from 'react';
import { 
  Text, Stack, Group, Card, 
  Avatar, Badge, Box, Tabs
} from '@mantine/core';
import { Users, Building2 } from 'lucide-react';
import { useSystem } from '@/hooks/useSystem';
import { SectionLoader } from '@/components/common/GlobalLoading';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { ActionButton } from '@/components/common/ActionButton';
import { DynamicTable } from '@/components/common/DynamicTable';

export default function EmployeesPage() {
  const {
    employees, branches, isLoading, deleteEmployee, deleteBranch
  } = useSystem();

  if (isLoading) return <SectionLoader />;

  const employeeColumns = [
    { 
      key: 'full_name', 
      label: 'Nhân sự', 
      render: (emp: any) => (
        <Group gap="sm">
          <Avatar color="brand" radius="xl" fw={700}>{emp.full_name?.charAt(0) || 'U'}</Avatar>
          <Box>
            <Text size="sm" fw={800}>{emp.full_name}</Text>
            <Text size="xs" c="dimmed">{emp.email}</Text>
          </Box>
        </Group>
      )
    },
    { 
      key: 'branch_name', 
      label: 'Chi nhánh', 
      render: (emp: any) => (
        <Badge color="brand" variant="light" radius="sm" fw={700}>
          {emp.branch_name || 'Hệ thống (Toàn bộ)'}
        </Badge>
      )
    },
    { 
      key: 'role', 
      label: 'Chức vụ', 
      render: (emp: any) => (
        <Badge color={emp.role === 'admin' ? 'red' : 'cyan'} variant="filled" radius="sm">
          {emp.role.toUpperCase()}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      label: 'Thao tác', 
      type: 'action',
      render: (emp: any) => (
        <Group gap={4} justify="center">
          <ActionButton type="edit" size="sm" />
          <ActionButton type="delete" size="sm" onClick={() => deleteEmployee(emp.id)} />
        </Group>
      )
    }
  ];

  const branchColumns = [
    {
      key: 'name',
      label: 'Tên Chi Nhánh',
      render: (br: any) => (
        <Box>
          <Text fw={800} size="sm">{br.name}</Text>
          <Text size="xs" c="dimmed">{br.phone || 'Chưa cập nhật hotline'}</Text>
        </Box>
      )
    },
    {
      key: 'address',
      label: 'Vị trí / Địa chỉ',
      render: (br: any) => <Text size="sm" fw={500}>{br.address || 'Chưa có địa chỉ'}</Text>
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (br: any) => (
        <Badge color={br.is_active ? 'green' : 'gray'} variant="light" radius="xs" fw={800}>
          {br.is_active ? 'ĐANG HOẠT ĐỘNG' : 'TẠM NGƯNG'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      type: 'action',
      render: (br: any) => (
        <Group gap={4} justify="center">
          <ActionButton type="edit" size="sm" />
          <ActionButton type="delete" size="sm" onClick={() => deleteBranch(br.id)} />
        </Group>
      )
    }
  ];

  return (
    <Stack gap="xl">
      <PageHeader
        title="Quản lý Nhân sự & Chi nhánh"
        description="Quản lý đội ngũ nhân viên và các địa điểm kinh doanh của hệ thống."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Nhân sự' }]}
      />

      <Card withBorder radius="xl" shadow="sm" p="xl" style={{ overflow: 'hidden', background: '#FFFFFF' }}>
        <Tabs defaultValue="staff" variant="pills" color="brand" radius="xl">
          <Tabs.List mb="xl">
            <Tabs.Tab value="staff" leftSection={<Users size={16} />}>Danh sách Nhân sự</Tabs.Tab>
            <Tabs.Tab value="branches" leftSection={<Building2 size={16} />}>Danh sách Chi nhánh</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="staff">
            <Group justify="space-between" mb="md">
               <Text fw={800} size="lg" c="gray.9">Tài khoản nhân viên</Text>
               <ActionButton type="add" label="Thêm nhân sự" variant="filled" />
            </Group>
            <DynamicTable columns={employeeColumns as any} data={employees} loading={isLoading} />
          </Tabs.Panel>

          <Tabs.Panel value="branches">
            <Group justify="space-between" mb="md">
               <Text fw={800} size="lg" c="gray.9">Chi nhánh hoạt động</Text>
               <ActionButton type="add" label="Thêm chi nhánh" variant="filled" />
            </Group>
            <DynamicTable columns={branchColumns as any} data={branches} loading={isLoading} />
          </Tabs.Panel>
        </Tabs>
      </Card>
    </Stack>
  );
}
