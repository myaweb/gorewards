"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const publicNavLinks = [
  { href: "/compare", label: "Cards" },
]

export function Navigation() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href)
  }

  
  return (
    <nav className="sticky top-0 z-50 w-full bg-[#090A0F]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image 
              src="/images/logo.png" 
              alt="CreditRich Logo" 
              width={180} 
              height={50} 
              className="object-contain mix-blend-screen h-auto" 
              priority 
            />
          </Link>

          {/* Navigation Links - Center (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium px-4 py-2 rounded-lg transition-all",
                  isActiveLink(link.href)
                    ? "text-white bg-white/5"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Right (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {!isLoaded ? (
              <div className="w-9 h-9 rounded-full bg-gray-700 animate-pulse" />
            ) : user ? (
              <>
                <Link href="/donate">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] transition-all font-semibold px-4 py-2 h-9"
                  >
                    ♥ Donate
                  </Button>
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    "text-sm font-medium px-4 py-2 rounded-lg transition-all",
                    isActiveLink("/dashboard")
                      ? "text-white bg-white/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  Dashboard
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-cyan-500/20 hover:ring-cyan-500/40 transition-all"
                    }
                  }}
                />
              </>
            ) : (
              <>
                <Link href="/donate">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] transition-all font-semibold px-4 py-2 h-9"
                  >
                    ♥ Donate
                  </Button>
                </Link>
                <Button 
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-all font-semibold px-5 py-2 h-10"
                  asChild
                >
                  <Link href="/sign-up">
                    Get Started
                  </Link>
                </Button>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-cyan-400 hover:text-white transition-all px-5 py-2 rounded-lg border border-cyan-500/40 hover:border-cyan-500/70 hover:bg-cyan-500/10">
                    Log In
                  </button>
                </SignInButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {isLoaded && user && (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
              />
            )}
            <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DialogTrigger asChild>
                <button 
                  className="text-gray-300 hover:text-white transition-colors p-2"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A0B0F] border-white/10 p-0 max-w-sm [&>button]:hidden">
                <div className="flex flex-col">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <Image 
                      src="/images/logo.png" 
                      alt="CreditRich" 
                      width={140} 
                      height={40} 
                      className="object-contain mix-blend-screen" 
                    />
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Mobile Menu Links */}
                  <div className="flex flex-col p-4 space-y-1">
                    {user && (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "text-base font-medium px-4 py-3 rounded-lg transition-all",
                          isActiveLink("/dashboard")
                            ? "text-white bg-white/10"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        )}
                      >
                        Dashboard
                      </Link>
                    )}
                    {publicNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "text-base font-medium px-4 py-3 rounded-lg transition-all",
                          isActiveLink(link.href)
                            ? "text-white bg-white/10"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Menu CTA */}
                  {!user && (
                    <div className="p-6 border-t border-white/10 space-y-3">
                      <Button 
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-all font-semibold h-12"
                        asChild
                      >
                        <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                      <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          variant="outline"
                          className="w-full border-pink-500/30 text-pink-400 hover:bg-pink-500/10 h-12 font-semibold"
                        >
                          ♥ Donate
                        </Button>
                      </Link>
                      <SignInButton mode="modal">
                        <button 
                          className="w-full text-sm font-medium text-gray-300 hover:text-white transition-colors py-3"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Log In
                        </button>
                      </SignInButton>
                    </div>
                  )}
                  {user && (
                    <div className="p-6 border-t border-white/10">
                      <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold h-12"
                        >
                          ♥ Donate
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </nav>
  )
}
