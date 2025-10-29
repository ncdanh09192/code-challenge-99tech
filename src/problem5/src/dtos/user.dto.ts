/**
 * Data Transfer Objects (DTOs) for User operations
 * DTOs provide a standardized contract for API requests and responses
 */

/**
 * Request DTOs
 */

/**
 * DTO for creating a new user
 * Used in: POST /users
 */
export interface CreateUserDTO {
    name: string;
    email: string;
    age: number;
}

/**
 * DTO for updating a user
 * All fields are optional for partial updates
 * Used in: PUT /users/:id
 */
export interface UpdateUserDTO {
    name?: string;
    email?: string;
    age?: number;
}

/**
 * DTO for list query parameters
 * Used in: GET /users with filters
 */
export interface ListUsersQueryDTO {
    name?: string;
    email?: string;
    minAge?: number;
    maxAge?: number;
    limit?: number;
    offset?: number;
}

/**
 * Response DTOs
 */

/**
 * User response DTO
 * Returned in all user-related endpoints
 */
export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    age: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Pagination metadata DTO
 * Included in list responses
 */
export interface PaginationDTO {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

/**
 * Generic API success response wrapper
 */
export interface ApiSuccessResponse<T> {
    success: true;
    data?: T;
    message?: string;
    pagination?: PaginationDTO;
}

/**
 * Generic API error response wrapper
 */
export interface ApiErrorResponse {
    success: false;
    error: string;
    details?: string;
    code?: string;
}

/**
 * Combined API response type
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Validation helper type
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * DTO validation result
 */
export interface ValidationResult {
    isValid: boolean;
    errors?: ValidationError[];
}
