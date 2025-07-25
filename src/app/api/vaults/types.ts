import { Vault, VaultStatistics } from "@/lib/database/types";

// API Response wrapper types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
}

// Vault API types
export interface VaultListResponse extends ApiResponse<Vault[]> {}

export interface VaultResponse extends ApiResponse<Vault> {}

export interface VaultWithStatsResponse extends ApiResponse<Vault & { statistics: VaultStatistics }> {}

export interface CreateVaultRequest {
  path: string;
  name: string;
}

export interface CreateVaultResponse extends ApiResponse<Vault> {}

export interface DeleteVaultResponse extends ApiResponse<{ deleted: boolean }> {}

// HTTP status codes for API responses
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;