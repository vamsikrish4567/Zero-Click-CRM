import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Plug2, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatWidget } from './ChatWidget'
import { ThemeToggle } from './ThemeToggle'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Connectors', href: '/connectors', icon: Plug2 },
  { name: 'Activity', href: '/activity', icon: Activity },
  // Data Sources is now integrated into Connectors page
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex flex-col h-full">
          {/* Logo & Theme Toggle */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-primary dark:text-blue-400">CRM Hub</h1>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground dark:bg-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI-Powered CRM Hub • v0.1.0
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  )
}

