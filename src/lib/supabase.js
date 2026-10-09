import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in the environment.',
  )
}

const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
const persistencePreferenceKey = `salamauth:${projectRef}:session-persistence`
const googleOAuthPendingKey = `salamauth:${projectRef}:google-oauth-pending`

function getPersistenceMode() {
  try {
    const tabPreference = window.sessionStorage.getItem(persistencePreferenceKey)
    if (tabPreference === 'session' || tabPreference === 'persistent') {
      return tabPreference
    }

    if (window.localStorage.getItem(persistencePreferenceKey) === 'persistent') {
      return 'persistent'
    }
  } catch {
    return 'persistent'
  }

  return 'persistent'
}

export function setAuthPersistence(rememberMe) {
  try {
    const persistentStorage = window.localStorage
    const tabStorage = window.sessionStorage

    if (rememberMe) {
      persistentStorage.setItem(persistencePreferenceKey, 'persistent')
      tabStorage.setItem(persistencePreferenceKey, 'persistent')
    } else {
      tabStorage.setItem(persistencePreferenceKey, 'session')
      persistentStorage.removeItem(persistencePreferenceKey)
    }

    return true
  } catch {
    return false
  }
}

export function markGoogleOAuthPending() {
  try {
    window.sessionStorage.setItem(googleOAuthPendingKey, 'true')
    return true
  } catch {
    return false
  }
}

export function consumeGoogleOAuthPending() {
  try {
    const isPending = window.sessionStorage.getItem(googleOAuthPendingKey) === 'true'
    window.sessionStorage.removeItem(googleOAuthPendingKey)
    return isPending
  } catch {
    return false
  }
}

export function hasGoogleOAuthPending() {
  try {
    return window.sessionStorage.getItem(googleOAuthPendingKey) === 'true'
  } catch {
    return false
  }
}

export function clearGoogleOAuthPending() {
  try {
    window.sessionStorage.removeItem(googleOAuthPendingKey)
  } catch {
    // Ignore unavailable session storage.
  }
}

const authStorage = {
  getItem(key) {
    try {
      const storage =
        getPersistenceMode() === 'session' ? window.sessionStorage : window.localStorage
      return storage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key, value) {
    const mode = getPersistenceMode()
    const activeStorage = mode === 'session' ? window.sessionStorage : window.localStorage
    const inactiveStorage = mode === 'session' ? window.localStorage : window.sessionStorage

    activeStorage.setItem(key, value)
    inactiveStorage.removeItem(key)
  },
  removeItem(key) {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        storage.removeItem(key)
      } catch {
        // Continue clearing the other storage location when one is unavailable.
      }
    }
  },
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: { storage: authStorage },
})

export async function startGoogleOAuth(rememberMe = true) {
  if (!setAuthPersistence(rememberMe)) {
    return 'Your browser could not configure session storage. Enable browser storage and try again.'
  }

  if (!markGoogleOAuthPending()) {
    return 'Your browser could not start Google sign-in. Enable browser storage and try again.'
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` },
    })

    if (error) {
      clearGoogleOAuthPending()
      return 'Google sign-in could not be started. Please try again.'
    }

    return ''
  } catch {
    clearGoogleOAuthPending()
    return 'Google sign-in could not be started. Please try again.'
  }
}
