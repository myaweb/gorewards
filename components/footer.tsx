"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#090A0F]">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="group hover:opacity-80 transition-opacity inline-block">
              <Image 
                src="/images/logo.png" 
                alt="GoRewards" 
                width={140} 
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              GoRewards helps Canadians make smarter credit card decisions by telling you exactly which card to use for every purchase.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Turn your everyday spending into a reward strategy.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/sign-up" className="hover:text-white transition-colors inline-block">Get Started</Link></li>
              <li><Link href="/cards" className="hover:text-white transition-colors inline-block">All Cards</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors inline-block">Compare Cards</Link></li>
              <li><Link href="/cards/no-annual-fee" className="hover:text-white transition-colors inline-block">No Annual Fee Cards</Link></li>
            </ul>
          </div>

          {/* Best For */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Best Cards For</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/cards/best-for/travel" className="hover:text-white transition-colors inline-block">Travel</Link></li>
              <li><Link href="/cards/best-for/groceries" className="hover:text-white transition-colors inline-block">Groceries</Link></li>
              <li><Link href="/cards/best-for/dining" className="hover:text-white transition-colors inline-block">Dining</Link></li>
              <li><Link href="/cards/best-for/gas" className="hover:text-white transition-colors inline-block">Gas</Link></li>
              <li><Link href="/cards/by-program/aeroplan" className="hover:text-white transition-colors inline-block">Aeroplan</Link></li>
              <li><Link href="/cards/by-program/cashback" className="hover:text-white transition-colors inline-block">Cash Back</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-white transition-colors inline-block">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors inline-block">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:support@gorewards.ca" className="hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@gorewards.ca
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GoRewards. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <span className="text-white/20">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>

          {/* Financial Disclaimer */}
          <div className="pt-6 border-t border-white/[0.05]">
            <div className="max-w-4xl mx-auto">
              <h4 className="text-xs font-semibold text-gray-400 mb-3 text-center">Financial Disclaimer</h4>
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                We are an independent publisher. We may earn a commission when you apply for products through our links. This does not impact our reviews or comparisons.
                The information provided is for general informational purposes only and should not be considered financial advice.
                Credit card offers, terms, and conditions are subject to change. Please verify current offers on the issuer's website before applying.
                We are not affiliated with any credit card issuer or financial institution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

