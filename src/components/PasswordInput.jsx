import { useState } from 'react'

function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  required = false,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="field-group">
      <label htmlFor={name}>{label}</label>
      <div className="password-wrapper">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? (
        <p id={`${name}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default PasswordInput
