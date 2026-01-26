import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Scale } from 'lucide-react'
import { UserButton, SignedIn, SignedOut, useAuth, SignInButton } from '@clerk/clerk-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const handleAIZoneClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSignedIn) {
      navigate('/ai')
    } else {
      // Redirect to sign in - will be handled by ProtectedRoute when navigating
      navigate('/ai')
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Scale className="h-7 w-7 text-orange-500" />
            <span className="text-xl font-semibold text-white tracking-tight">AskJunior</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/templates" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                isActive('/templates') ? "text-white" : "text-slate-300"
              )}
            >
              Templates
            </Link>
            <Link 
              to="/contact" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                isActive('/contact') ? "text-white" : "text-slate-300"
              )}
            >
              Contact
            </Link>
            <Link 
              to="/faq" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                isActive('/faq') ? "text-white" : "text-slate-300"
              )}
            >
              FAQ
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <Button 
              onClick={handleAIZoneClick}
              className={cn(
                "font-medium cursor-pointer",
                isActive('/ai')
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-orange-500 hover:bg-orange-600"
              )}
            >
              AI Zone
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
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
            <div className="px-2 pt-2 pb-3 space-y-2">
              <Link 
                to="/templates" 
                className={cn(
                  "block px-3 py-2 text-sm font-medium transition-colors hover:text-white hover:bg-slate-800 rounded-md",
                  isActive('/templates') ? "text-white bg-slate-800" : "text-slate-300"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Templates
              </Link>
              <Link 
                to="/contact" 
                className={cn(
                  "block px-3 py-2 text-sm font-medium transition-colors hover:text-white hover:bg-slate-800 rounded-md",
                  isActive('/contact') ? "text-white bg-slate-800" : "text-slate-300"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/faq" 
                className={cn(
                  "block px-3 py-2 text-sm font-medium transition-colors hover:text-white hover:bg-slate-800 rounded-md",
                  isActive('/faq') ? "text-white bg-slate-800" : "text-slate-300"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <Button 
                onClick={handleAIZoneClick}
                className={cn(
                  "w-full cursor-pointer",
                  isActive('/ai')
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-orange-500 hover:bg-orange-600"
                )}
              >
                AI Zone
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}