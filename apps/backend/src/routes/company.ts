import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply
} from 'fastify';
import { CompanyService } from '../services/CompanyService';

interface CreateCompanyBody {
  name: string;
  email: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  status?: string;
  employeeCount?: number;
}

interface CompanyParams {
  id: string;
}

async function companyRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Initialize CompanyService with database connection
  const companyService = new CompanyService((fastify as any).db);
  // Get all companies
  fastify.get(
    '/',
    {
      schema: {
        tags: ['companies'],
        summary: 'Get all companies',
        description: 'Retrieve a list of all companies',
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                description: { type: 'string' },
                website: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
                city: { type: 'string' },
                postalCode: { type: 'string' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      } as any
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      return await companyService.findAll();
    }
  );

  // Get company by ID
  fastify.get<{ Params: CompanyParams }>(
    '/:id',
    {
      schema: {
        tags: ['companies'],
        summary: 'Get company by ID',
        description: 'Retrieve a specific company by their ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' }
          },
          required: ['id']
        }
      } as any
    },
    async (
      request: FastifyRequest<{ Params: CompanyParams }>,
      reply: FastifyReply
    ) => {
      const companyId = parseInt(request.params.id);

      if (isNaN(companyId)) {
        return reply.status(400).send({
          error: {
            message: 'Invalid company ID',
            statusCode: 400
          }
        });
      }

      const company = await companyService.findById(companyId);

      if (!company) {
        return reply.status(404).send({
          error: {
            message: 'Company not found',
            statusCode: 404
          }
        });
      }

      return company;
    }
  );

  // Create new company
  fastify.post<{ Body: CreateCompanyBody }>(
    '/',
    {
      schema: {
        tags: ['companies'],
        summary: 'Create new company',
        description: 'Create a new company',
        body: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
            description: { type: 'string' },
            website: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            postalCode: { type: 'string' },
            status: { type: 'string' },
            employeeCount: { type: 'integer', minimum: 0 }
          }
        }
      } as any
    },
    async (
      request: FastifyRequest<{ Body: CreateCompanyBody }>,
      reply: FastifyReply
    ) => {
      try {
        const company = await companyService.create(request.body);
        return reply.status(201).send(company);
      } catch (error: any) {
        return reply.status(400).send({
          error: {
            message: error.message || 'Failed to create company',
            statusCode: 400
          }
        });
      }
    }
  );

  // Update company
  fastify.put<{ Params: CompanyParams; Body: Partial<CreateCompanyBody> }>(
    '/:id',
    {
      schema: {
        tags: ['companies'],
        summary: 'Update company',
        description: 'Update an existing company',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
            description: { type: 'string' },
            website: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            postalCode: { type: 'string' },
            status: { type: 'string' },
            employeeCount: { type: 'integer', minimum: 0 }
          }
        }
      } as any
    },
    async (
      request: FastifyRequest<{
        Params: CompanyParams;
        Body: Partial<CreateCompanyBody>;
      }>,
      reply: FastifyReply
    ) => {
      const companyId = parseInt(request.params.id);

      if (isNaN(companyId)) {
        return reply.status(400).send({
          error: {
            message: 'Invalid company ID',
            statusCode: 400
          }
        });
      }

      try {
        // Check if email is being updated and if it conflicts
        if (request.body.email) {
          const existingCompany = await companyService.findByEmail(
            request.body.email
          );
          if (existingCompany && existingCompany.id !== companyId) {
            return reply.status(400).send({
              error: {
                message: 'Company with this email already exists',
                statusCode: 400
              }
            });
          }
        }

        const company = await companyService.update(companyId, request.body);

        if (!company) {
          return reply.status(404).send({
            error: {
              message: 'Company not found',
              statusCode: 404
            }
          });
        }

        return company;
      } catch (error: any) {
        return reply.status(400).send({
          error: {
            message: error.message || 'Failed to update company',
            statusCode: 400
          }
        });
      }
    }
  );

  // Delete company
  fastify.delete<{ Params: CompanyParams }>(
    '/:id',
    {
      schema: {
        tags: ['companies'],
        summary: 'Delete company',
        description: 'Delete a company by ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' }
          },
          required: ['id']
        },
        response: {
          204: {
            type: 'null',
            description: 'Company deleted successfully'
          },
          404: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  statusCode: { type: 'integer' }
                }
              }
            }
          }
        }
      } as any
    },
    async (
      request: FastifyRequest<{ Params: CompanyParams }>,
      reply: FastifyReply
    ) => {
      const companyId = parseInt(request.params.id);

      if (isNaN(companyId)) {
        return reply.status(400).send({
          error: {
            message: 'Invalid company ID',
            statusCode: 400
          }
        });
      }

      const deleted = await companyService.delete(companyId);

      if (!deleted) {
        return reply.status(404).send({
          error: {
            message: 'Company not found',
            statusCode: 404
          }
        });
      }

      return reply.status(204).send();
    }
  );
}
export default companyRoutes;
