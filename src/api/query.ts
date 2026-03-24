import https from './https';
import { ApiQueryType } from './api.type';

export const fetchTables = async (params?: ApiQueryType['getTables']['url']['queryParams']) => {
  const { data } = await https.get<ApiQueryType['getTables']['response']>('/tables', { params });
  return data;
};

export const fetchProducts = async (params?: ApiQueryType['getProducts']['url']['queryParams']) => {
  const { data } = await https.get<ApiQueryType['getProducts']['response']>('/products', { params });
  return data;
};

export const fetchTableById = async (id: string) => {
  const { data } = await https.get<ApiQueryType['getTableById']['response']>(`/tables/${id}`);
  return data;
};
