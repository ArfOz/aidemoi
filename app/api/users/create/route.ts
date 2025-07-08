import { NextRequest, NextResponse } from "next/server"

interface createUserSchema {
  name: string
  email: string
}

// Simple email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate request data against schema
function validateUserData(data: createUserSchema): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required fields
  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Name is required and must be at least 1 character long")
  }

  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required")
  } else if (!isValidEmail(data.email)) {
    errors.push("Email must be a valid email format")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Validate against schema
    const validation = validateUserData(userData)
    if (!validation.valid) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    // Extract validated data
    const { name, email } = userData

    // TODO: Check if user already exists
    // TODO: Save user to database
    // For now, just return success

    // Mock successful response
    const newUser = {
      id: Date.now(), // Mock ID
      name: name.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
