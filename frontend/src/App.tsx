import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { AppShell } from '@/components/AppShell'

// Simple auth check
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />
}

// App dashboard placeholder
function AppDashboard() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold gradient-text mb-6">Welcome to AskJunior</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass glass-hover p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-white">AI Chat</h3>
            <p className="text-gray-300">Start a conversation with your legal AI assistant</p>
          </div>
          <div className="glass glass-hover p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-white">Document Analysis</h3>
            <p className="text-gray-300">Upload and analyze your legal documents</p>
          </div>
          <div className="glass glass-hover p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-white">Legal News</h3>
            <p className="text-gray-300">Stay updated with latest legal developments</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
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
  )
}

export default App