import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const [hasAvatarError, setHasAvatarError] = useState(false)
  const metadata = user.user_metadata || {}
  const fullName = metadata.full_name || metadata.name || 'Name unavailable'
  const avatarUrl = metadata.picture || metadata.avatar_url || ''
  const email = user.email || 'Email unavailable'
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const provider = user.app_metadata?.provider
  const identityProviders = user.identities?.map((identity) => identity.provider) || []
  const authProvider =
    provider === 'google' || (!provider && identityProviders.includes('google'))
      ? 'Google'
      : 'Email and password'
  const createdAt = user.created_at
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(user.created_at))
    : 'Unavailable'

  const handleSignOut = async () => {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)
    setSignOutError('')

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setSignOutError('We could not sign you out. Please try again.')
        return
      }

      navigate('/login', { replace: true })
    } catch {
      setSignOutError('Unable to reach the authentication service. Please try again.')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome back</h1>
        </div>
        <button
          type="button"
          className="primary-button danger-button"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </header>

      <main className="dashboard-card">
        {signOutError ? (
          <p className="form-alert error" role="alert">
            {signOutError}
          </p>
        ) : null}
        <h2 className="account-section-title">Profile &amp; account</h2>
        <div className="user-summary">
          <div className="user-avatar" aria-label="User avatar">
            {avatarUrl && !hasAvatarError ? (
              <img
                src={avatarUrl}
                alt={`${fullName} profile`}
                referrerPolicy="no-referrer"
                onError={() => setHasAvatarError(true)}
              />
            ) : (
              <span aria-hidden="true">{initials || 'U'}</span>
            )}
          </div>

          <div>
            <h2>{fullName}</h2>
            <p>{email}</p>
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-box">
            <span className="detail-label">Authentication provider</span>
            <strong>{authProvider}</strong>
          </div>

          <div className="detail-box">
            <span className="detail-label">Verification status</span>
            <strong>{user.email_confirmed_at ? 'Verified' : 'Unverified'}</strong>
          </div>

          <div className="detail-box">
            <span className="detail-label">Account created</span>
            <strong>{createdAt}</strong>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
