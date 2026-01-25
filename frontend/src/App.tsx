import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { LandingPage } from '@/pages/LandingPage'
import { AIZonePage } from '@/pages/AIZonePage'
import { AppShell } from '@/components/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// App dashboard placeholder
function AppDashboard() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Welcome to AskJunior</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-subtle p-6 rounded-xl hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-semibold mb-2 text-white">AI Chat</h3>
            <p className="text-slate-300">Start a conversation with your legal AI assistant</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800">
            <h3 className="text-lg font-semibold mb-2 text-white">Document Analysis</h3>
            <p className="text-slate-300">Upload and analyze your legal documents</p>
          </div>
          <div className="glass-subtle p-6 rounded-xl hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-semibold mb-2 text-white">Legal News</h3>
            <p className="text-slate-300">Stay updated with latest legal developments</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key')
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/ai" 
            element={
              <ProtectedRoute>
                <AIZonePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/*" 
            element={
              <ProtectedRoute>
                <AppShell>
                  <AppDashboard />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ClerkProvider>
  )
}

export default App