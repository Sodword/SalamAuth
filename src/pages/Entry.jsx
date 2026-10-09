import { Link } from 'react-router-dom'
import GoogleButton from '../components/GoogleButton'

function Entry() {
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
          <GoogleButton onClick={() => {}} />
        </div>
      </section>
    </main>
  )
}

export default Entry