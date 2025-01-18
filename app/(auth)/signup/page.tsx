import Link from "next/link"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getData } from 'country-list'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignupPage() {
  return (
    <AuthLayout isSignUp>
      <div className="flex-w-1/3 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#4B0082]">Tender Applicant Registration</h1>
        </div>
        <form className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4 space-y-2">
              <Label htmlFor="organization" className="text-sm font-medium text-gray-700">Organization Name</Label>
              <Input id="organization" defaultValue="Acme Consulting LLC" required className="rounded-md border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
              <Input id="firstName" defaultValue="Alice" required className="rounded-md border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
              <Input id="lastName" defaultValue="Johnson" required className="rounded-md border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">Job Title</Label>
              <Select defaultValue="select">
                <SelectTrigger className="rounded-md border-gray-300">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Work Phone Number</Label>
              <Input id="phone" type="tel" defaultValue="+1 344 736 9000" required className="rounded-md border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCount" className="text-sm font-medium text-gray-700">Employee Count</Label>
              <Input id="employeeCount" defaultValue="10-50" required className="rounded-md border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="establishmentDate" className="text-sm font-medium text-gray-700">Establishment Date</Label>
              <Input id="establishmentDate" type="date" defaultValue="1998-02-24" required className="rounded-md border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Organisation Email</Label>
              <Input id="email" type="email" defaultValue="info@acmeconsulting.co" required className="rounded-md border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-sm font-medium text-gray-700">Organisation Type</Label>
              <Select defaultValue="">
                <SelectTrigger className="rounded-md border-gray-300">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="non-profit">Not for Profit</SelectItem>
                  <SelectItem value="academic institution">Academic Institution</SelectItem>
                  <SelectItem value="government or multilateral agency">Government or Multilatral Agency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700">Organisation Registration Number</Label>
              <Input id="registrationNumber" defaultValue="RN765" required className="rounded-md border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
              <Select defaultValue="">
                <SelectTrigger className="rounded-md border-gray-300">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {getData().map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
              <Input id="city" defaultValue="Kansas City" required className="rounded-md border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">Postal Code</Label>
              <Input id="postalCode" defaultValue="902101" required className="rounded-md border-gray-300" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
              <Input id="address" defaultValue="1 Acme Street" required className="rounded-md border-gray-300" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-gray-700">Organisation Website</Label>
              <Input id="website" type="url" defaultValue="https://linkedin.com/acmeconsulting" required className="rounded-md border-gray-300" />
            </div>
            <div className="col-span-4 space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input id="password" type="password" defaultValue="••••••••••••" required className="rounded-md border-gray-300" />
            </div>
          </div>
          <Button className="w-full bg-[#4B0082] hover:bg-[#3B0062] text-white font-semibold py-2 px-4 rounded-md" type="submit">
            Sign Up
          </Button>
        </form>
        <div className="text-center text-sm">
          <p className="text-gray-600">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-[#4B0082] hover:underline font-medium">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#4B0082] hover:underline font-medium">
              Privacy policy
            </Link>
          </p>
          <div className="mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4B0082] hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

