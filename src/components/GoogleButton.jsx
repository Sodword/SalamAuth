function GoogleButton({ onClick, fullWidth = true, disabled = false, isLoading = false }) {
  return (
    <button
      type="button"
      className={`google-button ${fullWidth ? 'full-width' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3 2.3c1.8-1.7 2.8-4.2 2.8-7.2 0-.7-.1-1.4-.2-2.1H12z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.6 0 4.7-.8 6.3-2.3l-3-2.3c-.8.5-1.8.9-3.3.9-2.5 0-4.7-1.7-5.4-4h-3.2v2.5A9.9 9.9 0 0 0 12 22z"
        />
        <path
          fill="#FBBC05"
          d="M6.6 20.2A6 6 0 0 1 6 17.1V14.6H2.8A10 10 0 0 0 2 12c0-1.7.4-3.3 1.1-4.7L6.6 9.8A6 6 0 0 1 6 12c0 1.4.4 2.7 1.1 3.8l-.5 4.4z"
        />
        <path
          fill="#4285F4"
          d="M12 3.8c1.4 0 2.7.5 3.7 1.4l2.8-2.8A9.9 9.9 0 0 0 12 1a10 10 0 0 0-8.9 5.5l3.2 2.5c.7-2.3 2.9-4 5.7-4z"
        />
      </svg>
      {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
    </button>
  )
}

export default GoogleButton
