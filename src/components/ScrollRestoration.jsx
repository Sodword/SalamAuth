import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { hasGoogleOAuthPending } from '../lib/supabase'

function hasAuthCallbackInUrl() {
  const params = new URLSearchParams(window.location.hash.slice(1))
  new URLSearchParams(window.location.search).forEach((value, key) => {
    params.set(key, value)
  })

  return ['access_token', 'code', 'error', 'error_code', 'error_description'].some((key) =>
    params.has(key),
  )
}

function ScrollRestoration({ children }) {
  const location = useLocation()
  const { isLoading } = useAuth()
  const storageKey = `salamauth:scroll:${location.pathname}`
  const [initialLocation] = useState(() => ({
    pathname: location.pathname,
    key: location.key,
  }))
  const [isPageReload] = useState(
    () => performance.getEntriesByType('navigation')[0]?.type === 'reload',
  )
  const [hasOAuthCallbackAtEntry] = useState(
    () =>
      location.pathname === '/login' &&
      (hasGoogleOAuthPending() || hasAuthCallbackInUrl()),
  )
  const shouldRedirectToEntry =
    isPageReload &&
    initialLocation.pathname !== '/' &&
    !hasOAuthCallbackAtEntry &&
    location.pathname === initialLocation.pathname &&
    location.key === initialLocation.key

  useEffect(() => {
    if (isLoading || !isPageReload || initialLocation.pathname !== '/') {
      return undefined
    }

    let savedPosition
    try {
      savedPosition = Number(window.sessionStorage.getItem(storageKey))
    } catch {
      return undefined
    }

    if (!Number.isFinite(savedPosition) || savedPosition <= 0) {
      return undefined
    }

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: savedPosition, behavior: 'instant' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [initialLocation.pathname, isPageReload, isLoading, shouldRedirectToEntry, storageKey])

  useEffect(() => {
    if (isLoading || shouldRedirectToEntry) {
      return undefined
    }

    const savePosition = () => {
      try {
        window.sessionStorage.setItem(storageKey, String(window.scrollY))
      } catch {
        // Scroll restoration is optional when session storage is unavailable.
      }
    }

    window.addEventListener('scroll', savePosition, { passive: true })
    return () => window.removeEventListener('scroll', savePosition)
  }, [isLoading, shouldRedirectToEntry, storageKey])

  if (shouldRedirectToEntry) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ScrollRestoration