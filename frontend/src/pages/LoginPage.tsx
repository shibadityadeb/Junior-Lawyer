import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Scale, Eye, EyeOff } from 'lucide-react'
import { api } from '@/services/api'

export function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await api.auth.login(formData)
      localStorage.setItem('token', response.data.token)
      window.location.href = '/app'
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Scale className="h-10 w-10 text-cyan-400" />
            <span className="text-2xl font-bold text-white">AskJunior</span>
          </div>
          <h2 className="text-3xl font-bold gradient-text">Sign in to your account</h2>
          <p className="mt-2 text-gray-300">
            Don't have an account?{' '}
            <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign up
            </a>
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white">Welcome back</h3>
            <p className="text-gray-300 text-sm">Enter your credentials to access your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="glass bg-red-500/10 border-red-400/20 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 glass rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 glass rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-gray-600 rounded bg-white/10"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <a href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white border-0 shadow-lg shadow-cyan-500/25"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}