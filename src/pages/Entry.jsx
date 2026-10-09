import { useState } from 'react'
import { Link } from 'react-router-dom'
import GoogleButton from '../components/GoogleButton'
import { startGoogleOAuth } from '../lib/supabase'

function Entry() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) {
      return
    }

    setGoogleError('')
    setIsGoogleLoading(true)
    const error = await startGoogleOAuth(true)

    if (error) {
      setGoogleError(error)
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="entry-page">
      <section className="entry-content" aria-labelledby="entry-title">
        <div className="entry-brand">
          <div className="entry-profile" role="img" aria-label="Abdulsalam">
            <span aria-hidden="true">S</span>
            <img
              src="https://sodwordportfolio.netlify.app/images/abdulsalam.png"
              alt=""
              onError={(event) => {
                event.currentTarget.hidden = true
              }}
            />
          </div>
          <h1 id="entry-title" className="entry-wordmark">
            <span>Salam</span>
            <span className="entry-wordmark-accent">Auth</span>
          </h1>
          <p className="entry-tagline">Secure access, made simple.</p>
        </div>

        <div className="entry-actions">
          <Link className="entry-signup" to="/signup">
            Sign Up
          </Link>
          <Link className="entry-login" to="/login">
            Login
          </Link>
          <GoogleButton
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            isLoading={isGoogleLoading}
          />
          {googleError ? (
            <p className="form-alert error" role="alert">
              {googleError}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default Entry