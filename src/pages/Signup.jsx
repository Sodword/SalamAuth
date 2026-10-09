import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AuthInput from '../components/AuthInput'
import PasswordInput from '../components/PasswordInput'
import GoogleButton from '../components/GoogleButton'
import LoadingButton from '../components/LoadingButton'
import {
  setAuthPersistence,
  startGoogleOAuth,
  supabase,
} from '../lib/supabase'

const initialState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const validateForm = () => {
    const nextErrors = {}

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!validateEmail(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
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
      if (!setAuthPersistence(true)) {
        setSubmitError('Your browser could not configure session storage. Enable browser storage and try again.')
        return
      }

      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.fullName.trim() },
          emailRedirectTo: `${window.location.origin}/verify-email?email=${encodeURIComponent(form.email.trim())}`,
        },
      })

      if (error) {
        setSubmitError(error.message)
        return
      }

      navigate('/verify-email', { state: { email: form.email } })
    } catch {
      setSubmitError('We could not create your account. Check your connection and try again.')
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

    const error = await startGoogleOAuth(true)
    if (error) {
      setSubmitError(error)
      setIsGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start with a secure workspace built around your real authentication flow."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Log in"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="John Smith"
          autoComplete="name"
          error={errors.fullName}
          required
        />

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
          placeholder="Create a secure password"
          autoComplete="new-password"
          error={errors.password}
          required
        />

        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
        />

        <div className="password-hint">
          <span>Password must contain at least 8 characters.</span>
        </div>

        {submitError ? (
          <p className="form-alert error" role="alert">
            {submitError}
          </p>
        ) : null}

        <LoadingButton text="Create Account" isLoading={isSubmitting} />

        <div className="divider" aria-label="or continue with">
          <span>OR</span>
        </div>

        <GoogleButton
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          isLoading={isGoogleLoading}
        />
      </form>
    </AuthLayout>
  )
}

export default Signup
