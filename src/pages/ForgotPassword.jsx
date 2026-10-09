import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AuthInput from '../components/AuthInput'
import LoadingButton from '../components/LoadingButton'
import { supabase } from '../lib/supabase'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError('Email address is required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo: `${window.location.origin}/reset-password` },
      )

      if (requestError) {
        setSubmitError('We could not send a reset link. Please try again shortly.')
        return
      }

      setIsSent(true)
    } catch {
      setSubmitError('Unable to reach the authentication service. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={isSent ? 'Check your email' : 'Forgot your password?'}
      subtitle={
        isSent
          ? "If an account exists with this email address, we've sent you a password reset link."
          : 'Enter the email address associated with your account and we will send a reset link.'
      }
      footerText="Remember your password?"
      footerLink="/login"
      footerLinkText="Back to login"
    >
      {!isSent ? (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthInput
            label="Email address"
            type="email"
            name="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError('')
              setSubmitError('')
            }}
            placeholder="you@example.com"
            autoComplete="email"
            error={error}
            required
          />

          {submitError ? (
            <p className="form-alert error" role="alert">
              {submitError}
            </p>
          ) : null}

          <LoadingButton text="Send Reset Link" isLoading={isSubmitting} />
        </form>
      ) : (
        <div className="verification-panel">
          <div className="success-chip success">Reset link sent</div>
          <p className="form-alert success">
            If an account exists with this email address, we’ve sent you a password reset
            link.
          </p>
          <Link to="/login" className="primary-button wide-button">
            Back to Login
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword
