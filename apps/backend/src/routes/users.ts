// import {
//   FastifyInstance,
//   FastifyPluginOptions,
//   FastifyRequest,
//   FastifyReply,
// } from 'fastify';
// import { UserDBService } from '../services/DatabaseService/UserDBService';

// async function userRoutes(
//   fastify: FastifyInstance,
//   _options: FastifyPluginOptions
// ) {
//   // Initialize UserService with Prisma client from Fastify decoration
//   const userService = new UserDBService(fastify.prisma);

//   // User schema definitions
//   const userSchema = {
//     type: 'object',
//     properties: {
//       id: { type: 'integer' },
//       username: { type: 'string' },
//       email: { type: 'string', format: 'email' },
//       createdAt: { type: 'string', format: 'date-time' },
//       updatedAt: { type: 'string', format: 'date-time' },
//     },
//   };

//   const createUserSchema = {
//     type: 'object',
//     required: ['username', 'email', 'password'],
//     properties: {
//       username: { type: 'string', minLength: 1 },
//       email: { type: 'string', format: 'email' },
//       password: { type: 'string', minLength: 8 },
//     },
//   };

//   const updateUserSchema = {
//     type: 'object',
//     properties: {
//       username: { type: 'string', minLength: 1 },
//       email: { type: 'string', format: 'email' },
//       password: { type: 'string', minLength: 8 },
//     },
//   };

//   // Get all users
//   fastify.get(
//     '/',
//     {
//       schema: {
//         tags: ['users'],
//         summary: 'Get all users',
//         description: 'Retrieve a list of all users',
//         response: {
//           200: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               data: {
//                 type: 'array',
//                 items: userSchema,
//               },
//             },
//           },
//         },
//       } as any,
//     },
//     async (_request: FastifyRequest, _reply: FastifyReply) => {
//       const users = await userService.findAll();
//       return {
//         success: true,
//         data: users,
//       };
//     }
//   );

//   // Get user by ID
//   fastify.get<{ Params: UserParams }>(
//     '/:id',
//     {
//       schema: {
//         tags: ['users'],
//         summary: 'Get user by ID',
//         description: 'Retrieve a specific user by their ID',
//         params: {
//           type: 'object',
//           properties: {
//             id: { type: 'integer' },
//           },
//           required: ['id'],
//         },
//         response: {
//           200: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               data: userSchema,
//             },
//           },
//           404: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               error: {
//                 type: 'object',
//                 properties: {
//                   message: { type: 'string' },
//                   statusCode: { type: 'integer' },
//                 },
//               },
//             },
//           },
//         },
//       } as any,
//     },
//     async (
//       request: FastifyRequest<{ Params: UserParams }>,
//       reply: FastifyReply
//     ) => {
//       const { id } = request.params;
//       const user = await userService.findById(parseInt(id));

//       if (!user) {
//         return reply.status(404).send({
//           success: false,
//           error: {
//             message: 'User not found',
//             statusCode: 404,
//           },
//         });
//       }

//       return {
//         success: true,
//         data: user,
//       };
//     }
//   );

//   // Create a new user
//   fastify.post<{ Body: CreateUserBody }>(
//     '/',
//     {
//       schema: {
//         tags: ['users'],
//         summary: 'Create a new user',
//         description: 'Create a new user with username, email and password',
//         body: createUserSchema,
//         response: {
//           201: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               message: { type: 'string' },
//               user: {
//                 type: 'object',
//                 properties: {
//                   id: { type: 'string' },
//                   username: { type: 'string' },
//                   email: { type: 'string', format: 'email' },
//                 },
//               },
//             },
//           },
//           400: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               error: {
//                 type: 'object',
//                 properties: {
//                   message: { type: 'string' },
//                   statusCode: { type: 'integer' },
//                 },
//               },
//             },
//           },
//           409: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               error: {
//                 type: 'object',
//                 properties: {
//                   message: { type: 'string' },
//                   statusCode: { type: 'integer' },
//                 },
//               },
//             },
//           },
//         },
//       } as any,
//     },
//     async (
//       request: FastifyRequest<{ Body: CreateUserBody }>,
//       reply: FastifyReply
//     ) => {
//       const { username, email, password } = request.body;

//       try {
//         // Check if email already exists
//         const existingUser = await userService.findByEmail(email);
//         if (existingUser) {
//           return reply.status(409).send({
//             success: false,
//             error: {
//               message: 'User with this email already exists',
//               statusCode: 409,
//             },
//           });
//         }

//         const newUser = await userService.create({ username, email, password });

//         return reply.status(201).send({
//           success: true,
//           message:
//             'Account created. Please check your email to verify your account.',
//           user: {
//             id: newUser.id.toString(),
//             username: newUser.username,
//             email: newUser.email,
//           },
//         });
//       } catch (error) {
//         fastify.log.error(error);
//         return reply.status(500).send({
//           success: false,
//           error: {
//             message: 'Failed to create user',
//             statusCode: 500,
//           },
//         });
//       }
//     }
//   );

//   // Update a user
//   fastify.put<{ Params: UserParams; Body: CreateUserBody }>(
//     '/:id',
//     {
//       schema: {
//         tags: ['users'],
//         summary: 'Update a user',
//         description: 'Update an existing user',
//         params: {
//           type: 'object',
//           properties: {
//             id: { type: 'integer' },
//           },
//           required: ['id'],
//         },
//         body: updateUserSchema,
//         response: {
//           200: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               message: { type: 'string' },
//               data: userSchema,
//             },
//           },
//           404: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               error: {
//                 type: 'object',
//                 properties: {
//                   message: { type: 'string' },
//                   statusCode: { type: 'integer' },
//                 },
//               },
//             },
//           },
//           400: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               error: {
//                 type: 'object',
//                 properties: {
//                   message: { type: 'string' },
//                   statusCode: { type: 'integer' },
//                 },
//               },
//             },
//           },
//         },
//       } as any,
//     },
//     async (
//       request: FastifyRequest<{ Params: UserParams; Body: CreateUserBody }>,
//       reply: FastifyReply
//     ) => {
//       const { id } = request.params;
//       const { username, email } = request.body;

//       try {
//         // Check if user exists
//         const existingUser = await userService.findById(parseInt(id));
//         if (!existingUser) {
//           return reply.status(404).send({
//             success: false,
//             error: {
//               message: 'User not found',
//               statusCode: 404,
//             },
//           });
//         }

//         // Check if email already exists (excluding current user)
//         const emailUser = await userService.findByEmail(email);
//         if (emailUser && emailUser.id !== parseInt(id)) {
//           return reply.status(400).send({
//             success: false,
//             error: {
//               message: 'User with this email already exists',
//               statusCode: 400,
//             },
//           });
//         }

//         const updatedUser = await userService.update(parseInt(id), {
//           username,
//           email,
//         });

//         return {
//           success: true,
//           message: 'User updated successfully',
//           data: updatedUser,
//         };
//       } catch (error) {
//         fastify.log.error(error);
//         return reply.status(500).send({
//           success: false,
//           error: {
//             message: 'Failed to update user',
//             statusCode: 500,
//           },
//         });
//       }
//     }
//   );

//   // Delete a user
//   fastify.delete<{ Params: UserParams }>(
//     '/:id',
//     {
//       schema: {
//         tags: ['users'],
//         summary: 'Delete a user',
//         description: 'Delete an existing user',
//         params: {
//           type: 'object',
//           properties: {
//             id: { type: 'integer' },
//           },
//           required: ['id'],
//         },
//         response: {
//           200: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               message: { type: 'string' },
//             },
//           },
//           404: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               error: {
//                 type: 'object',
//                 properties: {
//                   message: { type: 'string' },
//                   statusCode: { type: 'integer' },
//                 },
//               },
//             },
//           },
//         },
//       } as any,
//     },
//     async (
//       request: FastifyRequest<{ Params: UserParams }>,
//       reply: FastifyReply
//     ) => {
//       const { id } = request.params;

//       try {
//         const deleted = await userService.delete(parseInt(id));

//         if (!deleted) {
//           return reply.status(404).send({
//             success: false,
//             error: {
//               message: 'User not found',
//               statusCode: 404,
//             },
//           });
//         }

//         return reply.status(200).send({
//           success: true,
//           message: 'User deleted successfully',
//         });
//       } catch (error) {
//         fastify.log.error(error);
//         return reply.status(500).send({
//           success: false,
//           error: {
//             message: 'Failed to delete user',
//             statusCode: 500,
//           },
//         });
//       }
//     }
//   );

//   // User login/authentication
//   fastify.post<{ Body: LoginBody }>(
//     '/login',
//     {
//       schema: {
//         tags: ['users'],
//         summary: 'User login',
//         description: 'Authenticate user with email and password',
//         body: {
//           type: 'object',
//           required: ['email', 'password'],
//           properties: {
//             email: { type: 'string', format: 'email' },
//             password: { type: 'string', minLength: 1 },
//           },
//         },
//         response: {
//           200: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               user: userSchema,
//               message: { type: 'string' },
//               token: { type: 'string' },
//             },
//           },
//           401: {
//             type: 'object',
//             properties: {
//               success: { type: 'boolean' },
//               error: {
//                 type: 'object',
//                 properties: {
//                   message: { type: 'string' },
//                   statusCode: { type: 'integer' },
//                 },
//               },
//             },
//           },
//         },
//       } as any,
//     },
//     async (
//       request: FastifyRequest<{ Body: LoginBody }>,
//       reply: FastifyReply
//     ) => {
//       try {
//         const { email, password } = request.body;

//         const user = await userService.authenticateUser(email, password);

//         if (!user) {
//           return reply.status(401).send({
//             success: false,
//             error: {
//               message: 'Invalid email or password',
//               statusCode: 401,
//             },
//           });
//         }

//         return reply.status(200).send({
//           success: true,
//           user,
//           message: 'Login successful',
//         });
//       } catch (error: any) {
//         fastify.log.error(error);
//         return reply.status(500).send({
//           success: false,
//           error: {
//             message: error.message || 'Login failed',
//             statusCode: 500,
//           },
//         });
//       }
//     }
//   );
// }

// export default userRoutes;
