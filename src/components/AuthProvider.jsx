import { useEffect, useState } from 'react'
import { AuthContext } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

const recoveryUserStorageKey = 'salamauth:password-recovery-user'

function getRecoveryUserId() {
  try {
    return window.sessionStorage.getItem(recoveryUserStorageKey)
  } catch {
    return null
  }
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    let isMounted = true
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (isMounted) {
        setSession(nextSession)
        if (event === 'PASSWORD_RECOVERY' && nextSession?.user?.id) {
          try {
            window.sessionStorage.setItem(recoveryUserStorageKey, nextSession.user.id)
          } catch {
            // Keep the recovery state in memory if session storage is unavailable.
          }
          setIsPasswordRecovery(true)
        } else if (event === 'SIGNED_OUT') {
          try {
            window.sessionStorage.removeItem(recoveryUserStorageKey)
          } catch {
            // The in-memory state is still cleared below.
          }
          setIsPasswordRecovery(false)
        } else {
          setIsPasswordRecovery(getRecoveryUserId() === nextSession?.user?.id)
        }
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    isLoading,
    isPasswordRecovery,
    clearPasswordRecovery: () => {
      try {
        window.sessionStorage.removeItem(recoveryUserStorageKey)
      } catch {
        // The in-memory state is still cleared below.
      }
      setIsPasswordRecovery(false)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider