import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

dayjs.locale('vi');
/**
 * Formats a number to Vietnamese Dong (VND) currency string.
 * @param amount The numeric amount to format.
 * @returns A string in the format "1.000.000 ₫".
 */
export const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '0 VNĐ';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

/**
 * Formats a date using native JS, similar to dayjs in simple cases
 * or just provides a wrapper if dayjs is preferred.
 */

export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
  return dayjs(date).format(format);
};

export const fromNow = (date: string | Date): string => {
  return dayjs(date).fromNow();
};
