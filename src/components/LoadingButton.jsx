function LoadingButton({
  text,
  isLoading = false,
  variant = 'primary',
  disabled = false,
  type = 'submit',
  onClick,
}) {
  return (
    <button
      type={type}
      className={`primary-button ${variant === 'secondary' ? 'secondary-button' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <span className="button-loader" aria-hidden="true">
          <span className="spinner" />
        </span>
      ) : null}
      {isLoading ? 'Please wait...' : text}
    </button>
  )
}

export default LoadingButton
