export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductMeta {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: ProductDimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMeta;
  thumbnail: string;
  images: string[];
  isLocal?: boolean;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  brand?: string;
  rating?: number;
}

export type SortField = 'price' | 'rating' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface ProductQueryParams {
  limit: number;
  skip: number;
  sortBy?: SortField;
  order?: SortDirection;
}
