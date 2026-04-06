"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Menu, X, LayoutDashboard, CreditCard, GitCompare, BookOpen, Heart, LogIn, Sparkles, ChevronDown, Utensils, ShoppingCart, Fuel, Plane, Receipt, Tag, Building2, Award } from "lucide-react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

const CARDS_DROPDOWN = {
  bestFor: [
    { href: "/cards/best-for/groceries",    label: "Groceries",     icon: ShoppingCart },
    { href: "/cards/best-for/dining",       label: "Dining",        icon: Utensils },
    { href: "/cards/best-for/gas",          label: "Gas",           icon: Fuel },
    { href: "/cards/best-for/travel",       label: "Travel",        icon: Plane },
    { href: "/cards/best-for/bills",        label: "Bills",         icon: Receipt },
    { href: "/cards/best-for/student",      label: "Students",      icon: Tag },
    { href: "/cards/best-for/business",     label: "Business",      icon: Building2 },
    { href: "/cards/best-for/signup-bonus", label: "Sign-Up Bonus", icon: Award },
    { href: "/cards/no-annual-fee",         label: "No Annual Fee", icon: Tag },
  ],
  byProgram: [
    { href: "/cards/by-program/aeroplan",           label: "Aeroplan" },
    { href: "/cards/by-program/scene-plus",         label: "Scene+" },
    { href: "/cards/by-program/membership-rewards", label: "Membership Rewards" },
    { href: "/cards/by-program/cashback",           label: "Cash Back" },
    { href: "/cards/by-program/avion",              label: "RBC Avion" },
  ],
  byBank: [
    { href: "/cards/by-bank/td",         label: "TD" },
    { href: "/cards/by-bank/rbc",        label: "RBC" },
    { href: "/cards/by-bank/amex",       label: "Amex" },
    { href: "/cards/by-bank/cibc",       label: "CIBC" },
    { href: "/cards/by-bank/scotiabank", label: "Scotiabank" },
    { href: "/cards/by-bank/bmo",        label: "BMO" },
  ],
}

const publicNavLinks = [
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "https://blog.creditrich.net", label: "Blog", icon: BookOpen, external: true },
]

export function Navigation() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cardsDropdownOpen, setCardsDropdownOpen] = useState(false)
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href)
  }

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setCardsDropdownOpen(true)
  }

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setCardsDropdownOpen(false), 150)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#090A0F]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
            onClick={() => window.dispatchEvent(new CustomEvent('reset-home'))}
          >
            <div
              style={{ backgroundImage: "url('/images/logo.png')" }}
              className="w-[180px] h-[50px] bg-contain bg-no-repeat bg-center select-none pointer-events-none"
              role="img"
              aria-label="GoRewards Logo"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">

            {/* Cards mega-dropdown */}
            <div
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                href="/cards"
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all",
                  isActiveLink("/cards")
                    ? "text-white bg-white/5"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Cards
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", cardsDropdownOpen && "rotate-180")} />
              </Link>

              {cardsDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[520px] bg-[#0D0E14] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 p-5 grid grid-cols-3 gap-5">
                  {/* Best For */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 mb-3 flex items-center gap-1.5">
                      <Award className="h-3 w-3" /> Best For
                    </p>
                    <div className="space-y-0.5">
                      {CARDS_DROPDOWN.bestFor.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <item.icon className="h-3.5 w-3.5 text-cyan-500/70 flex-shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* By Program */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 mb-3 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> By Program
                    </p>
                    <div className="space-y-0.5">
                      {CARDS_DROPDOWN.byProgram.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <Link href="/cards" className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-cyan-500 hover:text-cyan-400 transition-all">
                        All cards →
                      </Link>
                    </div>
                  </div>

                  {/* By Bank */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 mb-3 flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" /> By Bank
                    </p>
                    <div className="space-y-0.5">
                      {CARDS_DROPDOWN.byBank.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other nav links */}
            {publicNavLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all",
                    isActiveLink(link.href)
                      ? "text-white bg-white/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              )
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
                    <Heart className="h-3.5 w-3.5 mr-1.5 fill-current" />
                    Donate
                  </Button>
                </Link>
                <Link
                  href="/users"
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all",
                    isActiveLink("/users")
                      ? "text-white bg-white/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: { avatarBox: "w-9 h-9 ring-2 ring-cyan-500/20 hover:ring-cyan-500/40 transition-all" }
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
                    <Heart className="h-3.5 w-3.5 mr-1.5 fill-current" />
                    Donate
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-all font-semibold px-5 py-2 h-10"
                  asChild
                >
                  <Link href="/sign-up">Get Started</Link>
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
          <div className="md:hidden flex items-center space-x-2">
            {isLoaded && user && (
              <UserButton
                appearance={{
                  elements: { avatarBox: "w-9 h-9 ring-2 ring-cyan-500/20" }
                }}
              />
            )}
            <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DialogTrigger asChild>
                <button
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A0B10] border-white/10 p-0 max-w-[320px] w-[calc(100vw-2rem)] rounded-2xl shadow-2xl shadow-black/60 [&>button]:hidden">
                <div className="flex flex-col h-full max-h-[85vh] overflow-y-auto">

                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                    <div
                      style={{ backgroundImage: "url('/images/logo.png')" }}
                      className="w-[130px] h-[36px] bg-contain bg-no-repeat bg-center select-none pointer-events-none"
                      role="img"
                      aria-label="GoRewards"
                    />
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* User info */}
                  {isLoaded && user && (
                    <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">
                          {user.primaryEmailAddress?.emailAddress ?? user.fullName}
                        </p>
                      </div>
                      <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                    </div>
                  )}

                  {/* Nav Links */}
                  <nav className="flex flex-col px-3 pt-3 pb-2 space-y-0.5">
                    {user && (
                      <Link
                        href="/users"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          isActiveLink("/users")
                            ? "text-white bg-white/10 border border-white/10"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        Dashboard
                      </Link>
                    )}

                    <Link href="/cards" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                      <CreditCard className="h-4 w-4 shrink-0" /> All Cards
                    </Link>

                    {/* Mobile category links */}
                    <div className="px-4 pt-1 pb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-500/70 mb-2">Best For</p>
                      <div className="grid grid-cols-2 gap-1">
                        {CARDS_DROPDOWN.bestFor.map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            <item.icon className="h-3 w-3 text-cyan-500/60 flex-shrink-0" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="px-4 pb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-500/70 mb-2">By Program</p>
                      <div className="grid grid-cols-2 gap-1">
                        {CARDS_DROPDOWN.byProgram.map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                            className="px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {publicNavLinks.map((link) => {
                      const Icon = link.icon
                      const active = !link.external && isActiveLink(link.href)
                      return link.external ? (
                        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                          <Icon className="h-4 w-4 shrink-0" />
                          {link.label}
                          <span className="ml-auto text-[10px] text-gray-600">↗</span>
                        </a>
                      ) : (
                        <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                            active ? "text-white bg-white/10 border border-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                          )}>
                          <Icon className="h-4 w-4 shrink-0" />
                          {link.label}
                        </Link>
                      )
                    })}
                  </nav>

                  <div className="mx-4 border-t border-white/[0.07]" />

                  {/* CTA */}
                  <div className="px-4 py-4 space-y-2">
                    {!user ? (
                      <>
                        <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold h-11 rounded-xl" asChild>
                          <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                            <Sparkles className="h-4 w-4 mr-2" /> Get Started Free
                          </Link>
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full border-pink-500/30 text-pink-400 hover:bg-pink-500/10 h-10 rounded-xl text-sm font-medium">
                              <Heart className="h-3.5 w-3.5 mr-1.5 fill-current" /> Donate
                            </Button>
                          </Link>
                          <SignInButton mode="modal">
                            <button onClick={() => setMobileMenuOpen(false)}
                              className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white h-10 rounded-xl border border-white/10 hover:bg-white/5">
                              <LogIn className="h-3.5 w-3.5" /> Log In
                            </button>
                          </SignInButton>
                        </div>
                      </>
                    ) : (
                      <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold h-11 rounded-xl">
                          <Heart className="h-4 w-4 mr-2 fill-current" /> Support Us
                        </Button>
                      </Link>
                    )}
                  </div>

                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </nav>
  )
}


