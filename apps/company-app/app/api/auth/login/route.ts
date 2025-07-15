import { NextRequest, NextResponse } from 'next/server';

// Mock user data - in a real app, this would be in a database
const mockUsers = [
  {
    id: '1',
    email: 'john@customer.com',
    password: 'password123',
    name: 'John Customer',
    role: 'customer',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'jane@repairman.com',
    password: 'password123',
    name: 'Jane Repairman',
    role: 'repairman',
    phone: '+1-555-0123',
    specialties: ['Plumbing', 'Electrical'],
    hourlyRate: 75,
    isVerified: true,
    rating: 4.8,
    completedJobs: 156,
    createdAt: new Date().toISOString(),
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find user by email
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check password
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Mock tokens
    const tokens = {
      accessToken: `mock-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
      expiresIn: '7d'
    };

    return NextResponse.json({
      user: userWithoutPassword,
      tokens
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
