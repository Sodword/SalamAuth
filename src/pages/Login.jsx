import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AuthInput from '../components/AuthInput'
import PasswordInput from '../components/PasswordInput'
import GoogleButton from '../components/GoogleButton'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

const initialState = {
  email: '',
  password: '',
  rememberMe: true,
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    const callbackParams = new URLSearchParams(location.hash.slice(1))
    new URLSearchParams(location.search).forEach((value, key) => {
      callbackParams.set(key, value)
    })

    const callbackError = [
      callbackParams.get('error'),
      callbackParams.get('error_code'),
      callbackParams.get('error_description'),
    ]
      .filter(Boolean)
      .join(' ')

    if (callbackError) {
      const wasCancelled = /access_denied|cancel|denied/i.test(callbackError)
      navigate(location.pathname, {
        replace: true,
        state: {
          from: location.state?.from,
          oauthError: wasCancelled
            ? 'Google sign-in was cancelled.'
            : 'Google sign-in could not be completed. Please try again.',
        },
      })
      return
    }

    if (user) {
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    }
  }, [isAuthLoading, location.hash, location.pathname, location.search, location.state, navigate, user])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
    setNeedsEmailVerification(false)
    if (location.state?.oauthError) {
      navigate(location.pathname, {
        replace: true,
        state: location.state.from ? { from: location.state.from } : null,
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const nextErrors = {}
    const email = form.email.trim()

    if (!email) {
      nextErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.'
    }

    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      })

      if (error) {
        const message = error.message.toLowerCase()
        const isUnverified =
          error.code === 'email_not_confirmed' || message.includes('email not confirmed')
        const isInvalidCredentials =
          error.code === 'invalid_credentials' || message.includes('invalid login credentials')

        if (isUnverified) {
          setNeedsEmailVerification(true)
          setSubmitError('Please verify your email address before signing in.')
        } else if (isInvalidCredentials) {
          setSubmitError('Email or password is incorrect. Check your details and try again.')
        } else if (error.status === 429) {
          setSubmitError('Too many sign-in attempts. Please wait a moment and try again.')
        } else {
          setSubmitError('We could not sign you in right now. Please try again.')
        }
        return
      }

      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch {
      setSubmitError('Unable to reach the authentication service. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (isSubmitting || isGoogleLoading) {
      return
    }

    setSubmitError('')
    setIsGoogleLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/login` },
      })

      if (error) {
        setSubmitError('Google sign-in could not be started. Please try again.')
        setIsGoogleLoading(false)
      }
    } catch {
      setSubmitError('Google sign-in could not be started. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your account and continue your secure workflow."
      footerText="Need an account?"
      footerLink="/signup"
      footerLinkText="Create one"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
          required
        />

        <div className="form-row">
          <label className="checkbox-row" htmlFor="rememberMe">
            <input
              id="rememberMe"
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
            />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="text-link inline-link">
            Forgot Password?
          </Link>
        </div>

        {submitError || location.state?.oauthError ? (
          <p className="form-alert error" role="alert">
            {submitError || location.state.oauthError}{' '}
            {needsEmailVerification ? (
              <Link to="/verify-email" state={{ email: form.email.trim() }} className="text-link">
                Resend verification email
              </Link>
            ) : null}
          </p>
        ) : null}

        <LoadingButton text="Login" isLoading={isSubmitting} />

        <div className="divider" aria-label="or continue with">
          <span>OR</span>
        </div>

        <GoogleButton onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleLoading} />
      </form>
    </AuthLayout>
  )
}

export default Login
