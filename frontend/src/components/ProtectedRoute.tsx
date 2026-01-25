import { ReactNode } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute component
 * Renders children only if user is signed in
 * Otherwise redirects to Clerk Sign In page
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
