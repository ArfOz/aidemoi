import { NextRequest, NextResponse } from 'next/server';

// Mock user storage - in a real app, this would be in a database
const mockUsers: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const { name, email, password, role, phone, specialties } = userData;

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      email,
      name,
      role,
      phone: phone || undefined,
      specialties: specialties || undefined,
      isVerified: true,
      createdAt: new Date().toISOString(),
      ...(role === 'repairman' && {
        hourlyRate: 50, // Default rate
        rating: 0,
        completedJobs: 0,
      }),
    };

    // Add to mock storage
    mockUsers.push({ ...newUser, password });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = { ...newUser, password };

    // Mock tokens
    const tokens = {
      accessToken: `mock-token-${newUser.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${newUser.id}-${Date.now()}`,
      expiresIn: '7d',
    };

    return NextResponse.json({
      user: userWithoutPassword,
      tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
