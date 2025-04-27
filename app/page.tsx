"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Clock, Users, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="fixed w-full bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/Innobid Logo.jpg"
                alt="InnoBid Logo"
                width={200}
                height={100}
                priority
                className="h-8 w-auto max-h-full object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#why-us" className="text-muted-foreground hover:text-primary">
                Why Us?
              </Link>
              <Link href="#about" className="text-muted-foreground hover:text-primary">
                About
              </Link>
              <Link href="#services" className="text-muted-foreground hover:text-primary">
                Other Services
              </Link>
              <Link href="#contact" className="text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href="/login"
                className="text-primary hover:text-primary/90"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-4">
                <Link 
                  href="#why-us" 
                  className="text-muted-foreground hover:text-primary px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Why us?
                </Link>
                <Link 
                  href="#services" 
                  className="text-muted-foreground hover:text-primary px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Other Services
                </Link>
                <Link 
                  href="#about" 
                  className="text-muted-foreground hover:text-primary px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="#contact" 
                  className="text-muted-foreground hover:text-primary px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="px-2">
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <div className="flex items-center gap-2 px-2 py-2">
                    <span className="text-muted-foreground">Toggle theme:</span>
                    <ThemeToggle />
                  </div>
                  <Link 
                    href="/login"
                    className="text-primary hover:text-primary/90 px-2"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background pt-24 md:pt-32">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-primary leading-tight">
                Transform Your Procurement Process with Automation and AI
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-6">
                Welcome to the Innobid e-Procurement Portal, where efficiency meets transparency. 
                We're transforming how Governments, Not-for-profit Organizations and Businesses procure goods and services
                through a secure, efficient and transparent e-procurement platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link 
                  href="/signup" 
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
                >
                  Get Started <ArrowRight size={20} />
                </Link>
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/10 transition-colors w-full sm:w-auto"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full md:w-auto">
              <Image 
                src="/Innobid Crew.jpeg"
                alt="Innobid Founders"
                width={600}
                height={400}
                priority
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Why us Section */}
      <section id="why-us" className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
            Why Choose Innobid?
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fair & Competitive</h3>
              <p className="text-muted-foreground">Innobid increases competitiveness among businesses by leveling the playing field.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Procurement</h3>
              <p className="text-muted-foreground">Innobid automates the procurement process to reduce risk and cost of bids screening.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accountability & Transprency</h3>
              <p className="text-muted-foreground">The Innobid portal incorporates citizens in monitoring the procurement process to foster a culture of accountability, transparency and trust.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bid Anomaly Detection</h3>
              <p className="text-muted-foreground">The Innobid system leverages AI and Machine Learning to detect and flag anomalies in the bids submitted to predict and combat corruption before it happens.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Bidding</h3>
              <p className="text-muted-foreground">End-to-end encrypted bidding process ensuring maximum security.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">Get instant notifications on bid status and tender updates.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vendor Management</h3>
              <p className="text-muted-foreground">Efficient vendor registration and management system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">About InnoBid</h2>
            <p className="text-muted-foreground mb-8">
              Innobid is a tech startup that provides tech-for-good solutions including an e-procurement solution that automates the procurement process to reduce risk and cost of bids screening, leverages AI and Machine Learning to detect and flag anomalies in the bids submitted in order to predict and combat corruption before it happens, incorporates citizens in monitoring the procurement process to foster a culture of accountability, transparency and trust and increases fairness and competitiveness among businesses by leveling the playing field for businesses of all sizes.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8 mt-12">
              <div className="p-6 bg-card rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To include disfranchised groups into the national and global commerce and finance systems through innovative technology.
                </p>
              </div>
              <div className="p-6 bg-card rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the leading tech-for-good organization fostering fair and efficient business practices and empowerment of disfranchised groups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section id="services" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Other Services</h2>
            <p className="text-muted-foreground mb-8">
              When we are not busy building tech solutions, we are doing the following
            </p>
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8 mt-12">
              <div className="p-6 bg-card rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Procurement Advisory</h3>
                <p className="text-muted-foreground">
                  We help you establish your procurement digitalization strategy.
                </p>
              </div>
              <div className="p-6 bg-card rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Procurement Insights</h3>
                <p className="text-muted-foreground">
                  We provide you with rich insights and best practices on procurement.
                </p>
              </div>
              <div className="p-6 bg-card rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Anti-corruption Advocacy</h3>
                <p className="text-muted-foreground">
                  We work with global development partners to promote anti-corruption campaigns and initiatives.
                </p>
              </div>
              <div className="p-6 bg-card rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Multistakeholder collaborations</h3>
                <p className="text-muted-foreground">
                  We connect global procurement and anti-corruption players with relevant stakeholders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Contact Us</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card"
                  placeholder="Your message"
                />
              </div>
              <div className="mt-6">
                <button 
                  type="submit"
                  className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t text-card-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image
                src="/Innobid Logo.jpg"
                alt="InnoBid Logo"
                width={150}
                height={75}
                className="h-8 w-auto"
              />
              <p className="text-sm text-muted-foreground mt-2">
                &copy; {new Date().getFullYear()} InnoBid. All rights reserved.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link href="#contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
