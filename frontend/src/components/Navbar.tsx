import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Product', href: '#product' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Security', href: '#security' },
    { name: 'Pricing', href: '#pricing' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Scale className="h-7 w-7 text-orange-500" />
            <span className="text-xl font-semibold text-white tracking-tight">AskJunior</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-300 hover:text-white transition-colors font-medium text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Sign In
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-slate-800"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 text-slate-300 hover:text-white font-medium rounded-md hover:bg-slate-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                  Sign In
                </Button>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}