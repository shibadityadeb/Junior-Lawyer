import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  FileText, 
  AlertTriangle, 
  Scale, 
  Newspaper, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { icon: MessageCircle, label: 'AI Zone', href: '/app/ai' },
  { icon: FileText, label: 'Document Chat', href: '/app/documents' },
  { icon: AlertTriangle, label: 'SOS Legal Help', href: '/app/sos' },
  { icon: Scale, label: 'Legal Categories', href: '/app/categories' },
  { icon: Newspaper, label: 'News', href: '/app/news' },
  { icon: User, label: 'Profile', href: '/app/profile' },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">AskJunior</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </a>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">John Doe</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}