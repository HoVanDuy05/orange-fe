import { 
  Edit, Trash2, Eye, Check, X, Plus, Save, RotateCcw, 
  Search, ExternalLink, Filter, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { 
  ActionIcon, Tooltip, ActionIconProps, 
  Loader, Button, ButtonProps, Group, Text 
} from '@mantine/core';

export type ActionButtonType = 'edit' | 'delete' | 'view' | 'confirm' | 'cancel' | 'add' | 'save' | 'reset' | 'search' | 'external' | 'filter' | 'back' | 'next';

interface BaseProps {
  type: ActionButtonType;
  tooltip?: string | React.ReactNode;
  loading?: boolean;
  label?: string; // If provided, renders as a <Button> instead of <ActionIcon>
  iconOnly?: boolean;
}

const actionConfigs: Record<ActionButtonType, { icon: any, color: string, defaultLabel: string }> = {
  edit: { icon: Edit, color: 'brand', defaultLabel: 'Chỉnh sửa' },
  delete: { icon: Trash2, color: 'red', defaultLabel: 'Xóa' },
  view: { icon: Eye, color: 'cyan', defaultLabel: 'Xem chi tiết' },
  confirm: { icon: Check, color: 'green', defaultLabel: 'Xác nhận' },
  cancel: { icon: X, color: 'gray', defaultLabel: 'Hủy bỏ' },
  add: { icon: Plus, color: 'brand', defaultLabel: 'Thêm mới' },
  save: { icon: Save, color: 'brand', defaultLabel: 'Lưu thay đổi' },
  reset: { icon: RotateCcw, color: 'gray', defaultLabel: 'Làm mới' },
  search: { icon: Search, color: 'brand', defaultLabel: 'Tìm kiếm' },
  external: { icon: ExternalLink, color: 'gray', defaultLabel: 'Mở trang mới' },
  filter: { icon: Filter, color: 'brand', defaultLabel: 'Lọc dữ liệu' },
  back: { icon: ChevronLeft, color: 'gray', defaultLabel: 'Quay lại' },
  next: { icon: ChevronRight, color: 'gray', defaultLabel: 'Tiếp theo' },
};

export type ActionButtonProps = BaseProps & (ActionIconProps | ButtonProps) & { onClick?: (e: any) => void };

export const ActionButton = ({ 
  type, 
  tooltip, 
  onClick, 
  loading, 
  label,
  iconOnly = false,
  variant = 'light', 
  radius = 'md', 
  size = 'md',
  ...others 
}: ActionButtonProps) => {
  const config = actionConfigs[type];
  const Icon = config.icon;
  const showLabel = label || (!iconOnly && (type === 'add' || type === 'save' || type === 'confirm' || type === 'reset'));

  const iconSize = typeof size === 'string' ? rem(size) : 18;

  if (showLabel) {
    return (
      <Button
        leftSection={loading ? <Loader size={iconSize - 4} color="gray" /> : <Icon size={iconSize} strokeWidth={2.5} />}
        variant={variant as any}
        color={config.color}
        radius={radius}
        size={size as any}
        onClick={onClick}
        loading={loading}
        {...others as any}
      >
        {label || config.defaultLabel}
      </Button>
    );
  }

  const iconContent = (
    <ActionIcon 
      variant={variant as any} 
      color={config.color} 
      radius={radius} 
      size={size as any} 
      onClick={onClick} 
      disabled={loading}
      {...others as any}
    >
      {loading ? <Loader size="xs" color="currentColor" /> : <Icon size={iconSize} strokeWidth={2.5} />}
    </ActionIcon>
  );

  return (
    <Tooltip label={tooltip || config.defaultLabel} withArrow position="top" transitionProps={{ transition: 'pop' }} radius="sm">
      {iconContent}
    </Tooltip>
  );
};

function rem(size: any) {
  if (size === 'xs') return 12;
  if (size === 'sm') return 14;
  if (size === 'md') return 18;
  if (size === 'lg') return 22;
  if (size === 'xl') return 26;
  return 18;
}

