export interface ApiResponse<T> {
  data: T;
  code: number;
  errorMessage: string | null;
  success: boolean;
}

export interface PagedResponse<T> {
  items: T[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PageQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string | null;
  expiresAtUtc: string;
}

export interface Country {
  id: number;
  name: string | null;
  code: string | null;
}

export interface CountryRequest {
  name: string;
  code: string;
}

export interface City {
  id: number;
  name: string | null;
  countryId: number;
}

export interface CityRequest {
  name: string;
  countryId: number;
}
