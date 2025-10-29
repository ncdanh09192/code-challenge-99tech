/**
 * Validation utilities for DTOs
 */

import {
    CreateUserDTO,
    UpdateUserDTO,
    ListUsersQueryDTO,
    ValidationError,
    ValidationResult,
} from '../dtos/user.dto';

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate CreateUserDTO
 */
export function validateCreateUserDTO(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
        errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
    }

    if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
        errors.push({ field: 'email', message: 'Email is required and must be a non-empty string' });
    } else if (!EMAIL_REGEX.test(data.email)) {
        errors.push({ field: 'email', message: 'Email must be a valid email format' });
    }

    if (data.age === undefined || data.age === null) {
        errors.push({ field: 'age', message: 'Age is required' });
    } else if (typeof data.age !== 'number') {
        errors.push({ field: 'age', message: 'Age must be a number' });
    } else if (!Number.isInteger(data.age)) {
        errors.push({ field: 'age', message: 'Age must be an integer' });
    } else if (data.age < 0) {
        errors.push({ field: 'age', message: 'Age must be non-negative' });
    } else if (data.age > 150) {
        errors.push({ field: 'age', message: 'Age must be less than or equal to 150' });
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
    };
}

/**
 * Validate UpdateUserDTO
 */
export function validateUpdateUserDTO(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // At least one field must be provided
    if (data.name === undefined && data.email === undefined && data.age === undefined) {
        errors.push({
            field: 'body',
            message: 'At least one field is required (name, email, or age)',
        });
        return { isValid: false, errors };
    }

    // Validate name if provided
    if (data.name !== undefined) {
        if (typeof data.name !== 'string' || data.name.trim() === '') {
            errors.push({ field: 'name', message: 'Name must be a non-empty string' });
        }
    }

    // Validate email if provided
    if (data.email !== undefined) {
        if (typeof data.email !== 'string' || data.email.trim() === '') {
            errors.push({ field: 'email', message: 'Email must be a non-empty string' });
        } else if (!EMAIL_REGEX.test(data.email)) {
            errors.push({ field: 'email', message: 'Email must be a valid email format' });
        }
    }

    // Validate age if provided
    if (data.age !== undefined) {
        if (typeof data.age !== 'number') {
            errors.push({ field: 'age', message: 'Age must be a number' });
        } else if (!Number.isInteger(data.age)) {
            errors.push({ field: 'age', message: 'Age must be an integer' });
        } else if (data.age < 0) {
            errors.push({ field: 'age', message: 'Age must be non-negative' });
        } else if (data.age > 150) {
            errors.push({ field: 'age', message: 'Age must be less than or equal to 150' });
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
    };
}

/**
 * Validate ListUsersQueryDTO
 */
export function validateListUsersQueryDTO(query: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate minAge if provided
    if (query.minAge !== undefined) {
        const minAge = parseInt(query.minAge as string);
        if (isNaN(minAge)) {
            errors.push({ field: 'minAge', message: 'minAge must be a valid number' });
        } else if (minAge < 0) {
            errors.push({ field: 'minAge', message: 'minAge must be non-negative' });
        }
    }

    // Validate maxAge if provided
    if (query.maxAge !== undefined) {
        const maxAge = parseInt(query.maxAge as string);
        if (isNaN(maxAge)) {
            errors.push({ field: 'maxAge', message: 'maxAge must be a valid number' });
        } else if (maxAge < 0) {
            errors.push({ field: 'maxAge', message: 'maxAge must be non-negative' });
        }
    }

    // Validate limit if provided
    if (query.limit !== undefined) {
        const limit = parseInt(query.limit as string);
        if (isNaN(limit)) {
            errors.push({ field: 'limit', message: 'limit must be a valid number' });
        } else if (limit < 1) {
            errors.push({ field: 'limit', message: 'limit must be at least 1' });
        } else if (limit > 100) {
            errors.push({ field: 'limit', message: 'limit must not exceed 100' });
        }
    }

    // Validate offset if provided
    if (query.offset !== undefined) {
        const offset = parseInt(query.offset as string);
        if (isNaN(offset)) {
            errors.push({ field: 'offset', message: 'offset must be a valid number' });
        } else if (offset < 0) {
            errors.push({ field: 'offset', message: 'offset must be non-negative' });
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
    };
}
