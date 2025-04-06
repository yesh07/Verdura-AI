'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { MobileNav } from './mobile-nav'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Marketplace', path: '/marketplace' },
  { name: 'Meal Planner', path: '/planner' },
  { name: 'Smart Bundles', path: '/bundle' },
  { name: 'Macro Analyzer', path: '/macro-analyzer' },
  { name: 'Chat Assistant', path: '/chat' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-green-700">Verdura AI</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-green-700',
                pathname === item.path
                  ? 'text-green-700'
                  : 'text-gray-600'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="bg-green-700 hover:bg-green-800">
              Get Started
            </Button>
          </div>
          <MobileNav />
        </div>
      </div>
    </nav>
  )
} 