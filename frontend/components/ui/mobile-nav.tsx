'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Marketplace', path: '/marketplace' },
  { name: 'Meal Planner', path: '/planner' },
  { name: 'Smart Bundles', path: '/bundle' },
  { name: 'Macro Analyzer', path: '/macro-analyzer' },
  { name: 'Chat Assistant', path: '/chat' },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-white">
          <nav className="container grid gap-6 p-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center text-lg font-medium transition-colors hover:text-green-700',
                  pathname === item.path
                    ? 'text-green-700'
                    : 'text-gray-600'
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-4 pt-4">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
              <Button className="w-full bg-green-700 hover:bg-green-800">
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
} 