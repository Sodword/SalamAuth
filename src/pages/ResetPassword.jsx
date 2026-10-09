import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

const initialState = {
  password: '',
  confirmPassword: '',
}

function ResetPassword() {
  const navigate = useNavigate()
  const { user, isLoading, isPasswordRecovery, clearPasswordRecovery } = useAuth()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const hasRecoverySession = Boolean(user && isPasswordRecovery)

  const passwordChecks = [
    { label: 'At least 8 characters', valid: form.password.length >= 8 },
    { label: 'Includes a number', valid: /\d/.test(form.password) },
    { label: 'Includes a symbol', valid: /[^A-Za-z0-9]/.test(form.password) },
  ]

  const validateForm = () => {
    const nextErrors = {}

    if (!form.password) {
      nextErrors.password = 'New password is required.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.'
    } else if (!/\d/.test(form.password)) {
      nextErrors.password = 'Include at least one number.'
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      nextErrors.password = 'Include at least one symbol.'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password.'
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    return nextErrors
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validateForm()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const { error } = await supabase.auth.updateUser({ password: form.password })
      if (error) {
        setSubmitError(error.message || 'We could not update your password. Please try again.')
        return
      }

      clearPasswordRecovery()
      setIsSuccess(true)
    } catch {
      setSubmitError('Unable to reach the authentication service. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={isSuccess ? 'Password updated' : 'Reset your password'}
      subtitle={
        isSuccess
          ? 'Your password has been updated successfully.'
          : 'Choose a strong password and confirm it below.'
      }
      footerText="Need to sign in?"
      footerLink="/login"
      footerLinkText="Back to login"
    >
      {isLoading ? (
        <div className="verification-panel">
          <div className="success-chip">Checking reset link</div>
          <p role="status">Please wait while we validate your recovery session.</p>
        </div>
      ) : !isSuccess && !hasRecoverySession ? (
        <div className="verification-panel">
          <div className="success-chip">Reset link unavailable</div>
          <p className="form-alert error" role="alert">
            This password-reset link is invalid, expired, or already used. Request a new link to continue.
          </p>
          <Link to="/forgot-password" className="primary-button wide-button">
            Request a new reset link
          </Link>
        </div>
      ) : !isSuccess ? (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <PasswordInput
            label="New password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter a new password"
            autoComplete="new-password"
            error={errors.password}
            required
          />

          <PasswordInput
            label="Confirm new password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat the new password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            required
          />

          <div className="password-strength" aria-live="polite">
            <div className="strength-label">Password requirements</div>
            <ul className="requirements-list">
              {passwordChecks.map((item) => (
                <li key={item.label} className={item.valid ? 'valid' : ''}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {submitError ? (
            <p className="form-alert error" role="alert">
              {submitError}
            </p>
          ) : null}

          <LoadingButton text="Update Password" isLoading={isSubmitting} />
        </form>
      ) : (
        <div className="verification-panel">
          <div className="success-chip success">Password updated</div>
          <p className="form-alert success">
            Your new password is ready to use.
          </p>
          <button type="button" className="primary-button wide-button" onClick={() => navigate('/dashboard')}>
            Continue to Dashboard
          </button>
        </div>
      )}
    </AuthLayout>
  )
}

export default ResetPassword
