import { ApiQueryType } from "./api.type";

export const QueryEndpointMap: Record<keyof ApiQueryType, string> = {
  getTables: "/tables",
  getTableById: "/tables/:id",
  getProducts: "/products",
  getCategories: "/categories",
  getOrders: "/orders",
  getOrderById: "/orders/:id",
};
