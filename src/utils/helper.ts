export const formatCurrency = (amount: number | string) => {
  const val = Number(amount);
  if (isNaN(val)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(val);
};

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleString('vi-VN');
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'yellow';
    case 'confirmed': return 'blue';
    case 'preparing': return 'orange';
    case 'done': return 'green';
    case 'paid': return 'teal';
    case 'cancelled': return 'red';
    default: return 'gray';
  }
};
