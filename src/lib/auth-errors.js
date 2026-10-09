function normalizeAuthError(error) {
  return {
    name: typeof error?.name === 'string' ? error.name : 'Error',
    code: typeof error?.code === 'string' ? error.code.toLowerCase() : '',
    status: Number.isFinite(error?.status) ? error.status : 0,
    message: typeof error?.message === 'string' ? error.message.toLowerCase() : '',
  }
}

export function getLoginErrorMessage(error) {
  const { name, code, status, message } = normalizeAuthError(error)

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'Email or password is incorrect. Check your details and try again.'
  }

  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'Please verify your email address before signing in.'
  }

  if (status === 429) {
    return 'Too many sign-in attempts. Please wait a moment and try again.'
  }

  if (
    name === 'AuthStorageError' ||
    name === 'SecurityError' ||
    name === 'QuotaExceededError'
  ) {
    return 'Your browser could not save the sign-in session. Check your browser storage settings and try again.'
  }

  if (status === 404) {
    return 'Supabase Auth could not find this project endpoint. Check the Supabase project URL configuration.'
  }

  if (
    name === 'AuthRetryableFetchError' ||
    name === 'TypeError' ||
    /failed to fetch|fetch failed|networkerror|load failed/.test(message)
  ) {
    return 'Unable to reach Supabase Auth. Check your connection and try again.'
  }

  if (status >= 500) {
    return 'Supabase Auth is temporarily unavailable. Please try again shortly.'
  }

  if (name === 'AuthApiError') {
    return 'Supabase Auth rejected this sign-in request. Check the project authentication settings and try again.'
  }

  return 'Something unexpected prevented sign-in. Please try again.'
}

export function logAuthDiagnostic(operation, error) {
  if (!import.meta.env?.DEV) {
    return
  }

  const { name, code, status, message } = normalizeAuthError(error)
  const safeMessage = message
    .replace(/bearer\s+[^\s"']+/gi, 'Bearer [redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted token]')
    .replace(/(password|access_token|refresh_token|secret)\s*[:=]\s*[^,\s]+/gi, '$1=[redacted]')

  console.error('[SalamAuth] Authentication operation failed', {
    operation,
    name,
    code: code || undefined,
    status: status || undefined,
    message: safeMessage || undefined,
  })
}