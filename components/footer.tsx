"use client"

import Link from 'next/link'
import { CreditCard, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#090A0F]">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 group hover:opacity-80 transition-opacity">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative bg-gradient-to-br from-primary to-blue-400 p-2 rounded-lg">
                  <CreditCard className="h-5 w-5 text-background" />
                </div>
              </div>
              <span className="text-lg font-bold text-gradient">
                CreditRich
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Helping Canadians make smarter credit card reward decisions through personalized insights and comparison tools.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link 
                  href="/sign-up"
                  className="hover:text-white transition-colors inline-block"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/#calculator" className="hover:text-white transition-colors inline-block">
                  Calculator
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors inline-block">
                  Compare Cards
                </Link>
              </li>
              <li>
                <Link href="/donate" className="hover:text-white transition-colors inline-block">
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors inline-block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a 
                  href="mailto:support@CreditRich.com" 
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  support@CreditRich.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CreditRich. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-white/20">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
          
          {/* Financial Disclaimer */}
          <div className="pt-6 border-t border-white/[0.05]">
            <div className="max-w-4xl mx-auto">
              <h4 className="text-xs font-semibold text-gray-400 mb-3 text-center">
                Financial Disclaimer
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed text-center space-y-2">
                <span className="block">
                  We are an independent publisher. We may earn a commission when you apply for products through our links. This does not impact our reviews or comparisons.
                </span>
                <span className="block">
                  The information provided on this website is for general informational purposes only and should not be considered financial advice. Credit card offers, terms, and conditions are subject to change without notice. Please verify current offers on the issuer's website before applying.
                </span>
                <span className="block">
                  We are not affiliated with any credit card issuer or financial institution.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
