import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AuthLayout from '../components/AuthLayout'
import LoadingButton from '../components/LoadingButton'
import { supabase } from '../lib/supabase'

function getConfirmationError(error, callbackParams) {
  const message = [
    callbackParams.get('error_code'),
    callbackParams.get('error_description'),
    callbackParams.get('error'),
    error?.code,
    error?.message,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/otp_expired|expired|invalid|already used|verifier/.test(message)) {
    return 'This confirmation link is invalid, expired, or already used. Request a new verification email and open its latest link.'
  }

  return 'We could not verify this email with Supabase. Please try the latest confirmation link again.'
}

function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [callbackParams] = useState(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    new URLSearchParams(window.location.search).forEach((value, key) => {
      params.set(key, value)
    })
    return params
  })
  const hasAuthCallback = [
    'code',
    'access_token',
    'error',
    'error_description',
    'error_code',
  ].some((key) => callbackParams.has(key))
  const hasLegacyConfirmationMarker = searchParams.get('confirmed') === '1'
  const requestedEmail = searchParams.get('email') || location.state?.email || ''
  const [confirmationStatus, setConfirmationStatus] = useState(
    hasAuthCallback ? 'processing' : hasLegacyConfirmationMarker ? 'error' : 'pending',
  )
  const [confirmationError, setConfirmationError] = useState(
    hasLegacyConfirmationMarker && !hasAuthCallback
      ? 'This confirmation link did not complete verification with Supabase. Request a new verification email.'
      : '',
  )
  const [confirmedEmail, setConfirmedEmail] = useState('')
  const isConfirmed = confirmationStatus === 'success'
  const email = requestedEmail || confirmedEmail || 'your email address'
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState('idle')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!hasAuthCallback) {
      return undefined
    }

    let isActive = true

    const confirmEmail = async () => {
      const callbackError = [
        callbackParams.get('error'),
        callbackParams.get('error_description'),
        callbackParams.get('error_code'),
      ].some(Boolean)

      if (callbackError) {
        if (isActive) {
          setConfirmationError(getConfirmationError(null, callbackParams))
          setConfirmationStatus('error')
        }
        return
      }

      try {
        const { error: initializationError } = await supabase.auth.initialize()
        if (initializationError) {
          throw initializationError
        }

        const { data, error } = await supabase.auth.getUser()
        if (error) {
          throw error
        }

        const user = data.user
        if (!user || !(user.email_confirmed_at || user.confirmed_at)) {
          throw new Error('Supabase has not confirmed this email address yet.')
        }

        if (
          requestedEmail &&
          user.email?.toLowerCase() !== requestedEmail.trim().toLowerCase()
        ) {
          throw new Error('This confirmation link belongs to a different email address.')
        }

        if (isActive) {
          setConfirmedEmail(user.email || '')
          setConfirmationStatus('success')
        }
      } catch (error) {
        if (isActive) {
          setConfirmationError(getConfirmationError(error, callbackParams))
          setConfirmationStatus('error')
        }
      }
    }

    confirmEmail()

    return () => {
      isActive = false
    }
  }, [callbackParams, hasAuthCallback, requestedEmail])

  const startCooldown = () => {
    setCooldown(30)
    const timer = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          clearInterval(timer)
          return 0
        }

        return current - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (cooldown > 0) {
      return
    }

    setIsSending(true)
    setStatus('sending')

    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) {
        throw error
      }

      setStatus('success')
      startCooldown()
    } catch {
      setStatus('error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AuthLayout
      title={
        isConfirmed
          ? 'Email verified'
          : confirmationStatus === 'processing'
            ? 'Confirming your email'
            : 'Verify your email'
      }
      subtitle={
        isConfirmed
          ? 'Your email address has been verified. You can now sign in to your account.'
          : confirmationStatus === 'processing'
            ? 'Supabase is validating your confirmation link.'
            : 'Check your inbox for the verification link and open the latest email to activate your account.'
      }
      footerText="Return to"
      footerLink="/login"
      footerLinkText="Login"
    >
      <div className="verification-panel">
        <div className={`success-chip${isConfirmed ? ' success' : ''}`}>
          {isConfirmed
            ? 'Email verified'
            : confirmationStatus === 'processing'
              ? 'Verifying link'
              : confirmationStatus === 'error'
                ? 'Verification incomplete'
                : 'Verification required'}
        </div>
        {email !== 'your email address' ? <div className="email-display">{email}</div> : null}

        {confirmationStatus === 'error' ? (
          <p className="form-alert error" role="alert">
            {confirmationError}
          </p>
        ) : null}

        {!isConfirmed && status === 'success' ? (
          <p className="form-alert success">A new verification email has been sent.</p>
        ) : null}

        {!isConfirmed && status === 'error' ? (
          <p className="form-alert error">We could not resend the email. Please try again.</p>
        ) : null}

        {!isConfirmed && confirmationStatus !== 'processing' ? (
          <LoadingButton
            text={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
            isLoading={isSending}
            disabled={cooldown > 0 || isSending || email === 'your email address'}
            variant="secondary"
            onClick={handleResend}
          />
        ) : null}

        <button type="button" className="text-button" onClick={() => navigate('/login')}>
          Back to Login
        </button>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmail
