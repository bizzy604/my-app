import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: number
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      company?: string
      phone?: string
      businessType?: string
      registrationNumber?: string
      address?: string
      city?: string
      country?: string
      postalCode?: string
      website?: string
      employeeCount?: string
      establishmentDate?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}