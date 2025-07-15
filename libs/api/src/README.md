# Data Fetching Library

This library provides a comprehensive set of utilities for data fetching, validation, and management in the aidemoi application.

## Structure

```
lib/
├── api.ts          # Core API utilities and fetch wrapper
├── validation.ts   # Zod schemas for data validation
├── services.ts     # Service-related data fetching
├── users.ts        # User and authentication data fetching
├── requests.ts     # Request-related data fetching
├── utils.ts        # Utility functions (caching, formatting, etc.)
├── hooks.ts        # React hooks for data fetching
└── index.ts        # Main exports
```

## Usage

### Basic API Calls

```typescript
import { api } from '@/lib/api';

// GET request
const response = await api.get('/services');

// POST request
const response = await api.post('/services', { title: 'New Service' });

// PUT request
const response = await api.put('/services/123', { title: 'Updated Service' });

// DELETE request
await api.delete('/services/123');
```

### Data Validation

```typescript
import { userSchemas, validateData } from '@/lib/validation';

const result = validateData(userSchemas.registerUser, formData);
if (result.success) {
  // Use result.data
} else {
  // Handle result.errors
}
```

### Service Data Fetching

```typescript
import { serviceApi } from '@/lib/services';

// Get all services
const services = await serviceApi.getServices();

// Get services with filters
const filteredServices = await serviceApi.getServices({
  category: 'cleaning',
  location: 'zurich',
  page: 1,
  limit: 10
});

// Get single service
const service = await serviceApi.getService('123');

// Create new service
const newService = await serviceApi.createService({
  title: 'House Cleaning',
  description: 'Professional cleaning service',
  category: 'cleaning',
  location: 'Zurich',
  postalCode: '8000'
});
```

### User Authentication

```typescript
import { userApi } from '@/lib/users';

// Login
const authResponse = await userApi.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const authResponse = await userApi.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '8000'
});

// Get profile
const profile = await userApi.getProfile();
```

### React Hooks

```typescript
import { 
  useServices, 
  useService, 
  useProfile, 
  useCreateService,
  useAuth 
} from '@/lib/hooks';

function ServicesPage() {
  const { data: services, loading, error, refetch } = useServices();
  const { createService, loading: creating } = useCreateService();
  
  const handleCreate = async (data) => {
    try {
      await createService(data);
      refetch(); // Refresh the services list
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {services?.services.map(service => (
        <div key={service.id}>{service.title}</div>
      ))}
    </div>
  );
}
```

### Caching and Utilities

```typescript
import { cache, storage, formatCurrency, debounce } from '@/lib/utils';

// Cache data
cache.set('user-preferences', { theme: 'dark' }, 5 * 60 * 1000); // 5 minutes TTL
const preferences = cache.get('user-preferences');

// Local storage
storage.set('user-settings', { language: 'en' });
const settings = storage.get('user-settings');

// Format currency
const price = formatCurrency(29.99); // "29,99 €"

// Debounce function
const debouncedSearch = debounce((searchTerm) => {
  // Perform search
}, 300);
```

## Environment Variables

Make sure to set the following environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Error Handling

All API functions throw errors that should be caught and handled appropriately:

```typescript
try {
  const services = await serviceApi.getServices();
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.message, error.status);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Type Safety

All functions and hooks are fully typed with TypeScript. Import the types you need:

```typescript
import type { 
  Service, 
  ServiceQueryData, 
  User, 
  ServiceRequest 
} from '@/lib';
```

## Best Practices

1. **Use hooks in React components** for automatic caching and state management
2. **Validate data** before sending to API using the validation schemas
3. **Handle errors** appropriately in your components
4. **Use debouncing** for search inputs and frequent API calls
5. **Cache data** when appropriate to reduce API calls
6. **Use TypeScript** for better development experience and fewer runtime errors
