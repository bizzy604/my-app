import { NextResponse } from 'next/server'
import { CreateUser } from '@/app/actions/auth-actions'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma' // Ensure correct import path

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()
    
    console.log("Received registration data:", { name, email, role })

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 })
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists.' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Hashed password:", hashedPassword)

    // Create the user with hashed password and normalized email
    const user = await CreateUser(name, normalizedEmail, hashedPassword, role)

    console.log("User created:", user)

    return NextResponse.json({ message: 'User created successfully.', user }, { status: 201 })
  } catch (error) {
    console.error('Registration Error:', error)
    return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 })
  }
}