import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
  }
  
let users: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "vendor@example.com",
    password: "password",
    role: "vendor"
  },
  {
    id: 2,
    name: "John Smith",
    email: "citizen@example.com",
    password: "password",
    role: "citizen"
  },
  {
    id: 3,
    name: "Sarah Wilson",
    email: "procurement@example.com",
    password: "password", //Hashed password
    role: "procurement"
  }
];

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role
    }

    // Add user to "database"
    users.push(newUser)

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Failed to register" }, { status: 500 })
  }
}