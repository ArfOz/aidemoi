// /**
//  * Data validation utilities using Zod
//  */

// import { z } from 'zod';

// // Common validation schemas
// export const commonSchemas = {
//   email: z.string().email('Invalid email format'),
//   password: z.string().min(8, 'Password must be at least 8 characters'),
//   phoneNumber: z
//     .string()
//     .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format'),
//   postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
//   url: z.string().url('Invalid URL format'),
//   uuid: z.string().uuid('Invalid UUID format'),
//   positiveNumber: z.number().positive('Must be a positive number'),
//   nonEmptyString: z.string().min(1, 'This field is required'),
// };

// // User-related schemas
// export const userSchemas = {
//   registerUser: z.object({
//     email: commonSchemas.email,
//     password: commonSchemas.password,
//     firstName: commonSchemas.nonEmptyString.max(50, 'First name too long'),
//     lastName: commonSchemas.nonEmptyString.max(50, 'Last name too long'),
//     phoneNumber: commonSchemas.phoneNumber.optional(),
//     postalCode: commonSchemas.postalCode,
//   }),

//   loginUser: z.object({
//     email: commonSchemas.email,
//     password: commonSchemas.nonEmptyString,
//   }),

//   updateProfile: z.object({
//     firstName: commonSchemas.nonEmptyString
//       .max(50, 'First name too long')
//       .optional(),
//     lastName: commonSchemas.nonEmptyString
//       .max(50, 'Last name too long')
//       .optional(),
//     phoneNumber: commonSchemas.phoneNumber.optional(),
//     postalCode: commonSchemas.postalCode.optional(),
//   }),
// };

// // Service-related schemas
// export const serviceSchemas = {
//   createService: z.object({
//     title: commonSchemas.nonEmptyString.max(100, 'Title too long'),
//     description: commonSchemas.nonEmptyString.max(500, 'Description too long'),
//     category: commonSchemas.nonEmptyString,
//     price: commonSchemas.positiveNumber.optional(),
//     location: commonSchemas.nonEmptyString,
//     postalCode: commonSchemas.postalCode,
//     images: z.array(commonSchemas.url).optional(),
//     tags: z.array(commonSchemas.nonEmptyString).optional(),
//   }),

//   updateService: z.object({
//     title: commonSchemas.nonEmptyString.max(100, 'Title too long').optional(),
//     description: commonSchemas.nonEmptyString
//       .max(500, 'Description too long')
//       .optional(),
//     category: commonSchemas.nonEmptyString.optional(),
//     price: commonSchemas.positiveNumber.optional(),
//     location: commonSchemas.nonEmptyString.optional(),
//     postalCode: commonSchemas.postalCode.optional(),
//     images: z.array(commonSchemas.url).optional(),
//     tags: z.array(commonSchemas.nonEmptyString).optional(),
//   }),

//   serviceQuery: z.object({
//     category: commonSchemas.nonEmptyString.optional(),
//     location: commonSchemas.nonEmptyString.optional(),
//     postalCode: commonSchemas.postalCode.optional(),
//     minPrice: commonSchemas.positiveNumber.optional(),
//     maxPrice: commonSchemas.positiveNumber.optional(),
//     tags: z.array(commonSchemas.nonEmptyString).optional(),
//     page: z.number().positive().optional(),
//     limit: z.number().positive().max(100).optional(),
//   }),
// };

// // Request-related schemas
// export const requestSchemas = {
//   createRequest: z.object({
//     title: commonSchemas.nonEmptyString.max(100, 'Title too long'),
//     description: commonSchemas.nonEmptyString.max(500, 'Description too long'),
//     category: commonSchemas.nonEmptyString,
//     budget: commonSchemas.positiveNumber.optional(),
//     location: commonSchemas.nonEmptyString,
//     postalCode: commonSchemas.postalCode,
//     deadline: z.date().optional(),
//     priority: z.enum(['low', 'medium', 'high']).optional(),
//   }),

//   updateRequest: z.object({
//     title: commonSchemas.nonEmptyString.max(100, 'Title too long').optional(),
//     description: commonSchemas.nonEmptyString
//       .max(500, 'Description too long')
//       .optional(),
//     category: commonSchemas.nonEmptyString.optional(),
//     budget: commonSchemas.positiveNumber.optional(),
//     location: commonSchemas.nonEmptyString.optional(),
//     postalCode: commonSchemas.postalCode.optional(),
//     deadline: z.date().optional(),
//     priority: z.enum(['low', 'medium', 'high']).optional(),
//     status: z.enum(['active', 'completed', 'cancelled']).optional(),
//   }),
// };

// // Generic validation function
// export function validateData<T>(
//   schema: z.ZodSchema<T>,
//   data: unknown
// ): {
//   success: boolean;
//   data?: T;
//   errors?: string[];
// } {
//   try {
//     const result = schema.parse(data);
//     return { success: true, data: result };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return {
//         success: false,
//         errors: error.issues.map(
//           (err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`
//         ),
//       };
//     }
//     return {
//       success: false,
//       errors: ['Validation failed'],
//     };
//   }
// }

// // Safe parse function that returns typed result
// export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown) {
//   return schema.safeParse(data);
// }

// // Type exports for use in components
// export type RegisterUserData = z.infer<typeof userSchemas.registerUser>;
// export type LoginUserData = z.infer<typeof userSchemas.loginUser>;
// export type UpdateProfileData = z.infer<typeof userSchemas.updateProfile>;
// export type CreateServiceData = z.infer<typeof serviceSchemas.createService>;
// export type UpdateServiceData = z.infer<typeof serviceSchemas.updateService>;
// export type ServiceQueryData = z.infer<typeof serviceSchemas.serviceQuery>;
// export type CreateRequestData = z.infer<typeof requestSchemas.createRequest>;
// export type UpdateRequestData = z.infer<typeof requestSchemas.updateRequest>;
