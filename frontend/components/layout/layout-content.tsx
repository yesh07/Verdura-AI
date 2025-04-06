'use client'

import Link from "next/link"
import { motion } from "framer-motion"

export function LayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear()
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-3xl font-bold text-[#4CAF50]">Verdura AI</span>
              </motion.div>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 px-8">
              <ul className="flex justify-center space-x-8 text-lg">
                <motion.li whileHover={{ y: -2 }}>
                  <Link href="/marketplace" className="text-gray-700 hover:text-[#4CAF50]">
                    Marketplace
                  </Link>
                </motion.li>
                <motion.li whileHover={{ y: -2 }}>
                  <Link href="/planner" className="text-gray-700 hover:text-[#4CAF50]">
                    Meal Planner
                  </Link>
                </motion.li>
                <motion.li whileHover={{ y: -2 }}>
                  <Link href="/bundle" className="text-gray-700 hover:text-[#4CAF50]">
                    Smart Bundles
                  </Link>
                </motion.li>
                <motion.li whileHover={{ y: -2 }}>
                  <Link href="/macro-analyzer" className="text-gray-700 hover:text-[#4CAF50]">
                    Macro Analyzer
                  </Link>
                </motion.li>
                <motion.li whileHover={{ y: -2 }}>
                  <Link href="/chat-assistant" className="text-gray-700 hover:text-[#4CAF50]">
                    Chat Assistant
                  </Link>
                </motion.li>
                <motion.li whileHover={{ y: -2 }}>
                  <Link href="/learn" className="text-gray-700 hover:text-[#4CAF50]">
                    Learn More
                  </Link>
                </motion.li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            {/* Brand */}
            <div className="flex-1 space-y-4 max-w-md">
              <Link href="/" className="text-2xl font-bold text-[#4CAF50]">
                Verdura AI
              </Link>
              <p className="text-gray-600">
                Empowering Chicagoans with AI-driven local produce recommendations for healthier, more sustainable living.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/marketplace" className="text-gray-600 hover:text-[#4CAF50]">
                    Find Local Markets
                  </Link>
                </li>
                <li>
                  <Link href="/planner" className="text-gray-600 hover:text-[#4CAF50]">
                    Create Meal Plans
                  </Link>
                </li>
                <li>
                  <Link href="/bundle" className="text-gray-600 hover:text-[#4CAF50]">
                    Smart Bundles
                  </Link>
                </li>
                <li>
                  <Link href="/macro-analyzer" className="text-gray-600 hover:text-[#4CAF50]">
                    Macro Analyzer
                  </Link>
                </li>
                <li>
                  <Link href="/learn" className="text-gray-600 hover:text-[#4CAF50]">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
              <p className="text-gray-600">
                Chicago, IL<br />
                Email: yeshwanth1781@gmail.com
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t text-center text-gray-500">
            <p>© {currentYear} Verdura AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 