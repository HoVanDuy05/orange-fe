export type TPaginatorResponse<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
};

export type TResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// =============================
// Query Types
// =============================
export type ApiQueryType = {
  getTables: {
    url: {
      baseUrl: "/tables";
      queryParams?: {
        status?: 'empty' | 'occupied';
      };
    };
    response: TResponse<any[]>;
  };

  getTableById: {
    url: {
      baseUrl: "/tables/:id";
      urlParams: {
        id: string;
      };
    };
    response: TResponse<any>;
  };

  getProducts: {
    url: {
      baseUrl: "/products";
      queryParams?: {
        categoryId?: string;
        search?: string;
        isActive?: boolean;
      };
    };
    response: TResponse<any[]>;
  };

  getCategories: {
    url: {
      baseUrl: "/categories";
    };
    response: TResponse<any[]>;
  };

  getOrders: {
    url: {
      baseUrl: "/orders";
      queryParams?: {
        tableId?: string;
        status?: string;
      };
    };
    response: TResponse<any[]>;
  };

  getOrderById: {
    url: {
      baseUrl: "/orders/:id";
      urlParams: {
        id: string;
      };
    };
    response: TResponse<any>;
  };
};

// =============================
// Mutation Types
// =============================
export type ApiMutationType = {
  createOrder: {
    body: {
      tableId: number;
      items: { productId: number; quantity: number }[];
      note?: string;
    };
    response: TResponse<any>;
  };

  updateOrderStatus: {
    urlParams: {
      id: string;
    };
    body: {
      status: string;
    };
    response: TResponse<any>;
  };

  login: {
    body: {
      email: string;
      password_hash: string;
    };
    response: TResponse<{
      token: string;
      user: any;
    }>;
  };
};
