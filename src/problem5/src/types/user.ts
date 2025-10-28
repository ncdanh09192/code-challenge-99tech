/**
 * User interface and types
 */

export interface User {
    id: string;
    name: string;
    email: string;
    age: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    age: number;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    age?: number;
}

export interface ListUsersQuery {
    name?: string;
    email?: string;
    minAge?: number;
    maxAge?: number;
    limit?: number;
    offset?: number;
}
