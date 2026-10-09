import { Link } from 'react-router-dom'

function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,
}) {
  return (
    <div className="auth-page-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" className="brand-mark" aria-label="SalamAuth homepage">
            <span className="brand-badge">
              <span aria-hidden="true">S</span>
              <img
                src="https://sodwordportfolio.netlify.app/images/abdulsalam.png"
                alt=""
                onError={(event) => {
                  event.currentTarget.hidden = true
                }}
              />
            </span>
            <span>SalamAuth</span>
          </Link>
        </div>

        <div className="auth-header">
          <p className="eyebrow">Secure authentication</p>
          <h1>{title}</h1>
          {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        </div>

        {children}

        {footerText ? (
          <p className="auth-footer">
            {footerText}{' '}
            {footerLink ? (
              <Link to={footerLink} className="text-link">
                {footerLinkText}
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default AuthLayout
