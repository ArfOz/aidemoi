import { NextRequest, NextResponse } from 'next/server';

// Mock user data - in a real app, this would be in a database
const mockUsers = [
  {
    id: '1',
    email: 'customer@test.com',
    password: 'password123', // In real app, this would be hashed
    username: 'Test Customer',
    name: 'Test Customer',
    role: 'customer',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'repairman@test.com',
    password: 'password123',
    username: 'Test Repairman',
    name: 'Test Repairman',
    role: 'repairman',
    phone: '+1-555-0123',
    specialties: ['Plumbing', 'Electrical'],
    hourlyRate: 75,
    isVerified: true,
    rating: 4.8,
    completedJobs: 156,
    createdAt: new Date().toISOString(),
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = mockUsers.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check password
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate mock tokens
    const tokens = {
      accessToken: `mock-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    console.log('Login successful for user:', userWithoutPassword.email);

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokens,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
