import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'error' | 'warning' | 'info' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  shape?: 'circle' | 'square'
  loading?: boolean
  block?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  shape,
  loading = false,
  block = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'btn'
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-primary',
    ghost: 'btn-outline',
    outline: 'btn-outline',
    error: 'btn-error',
    warning: 'btn-warning',
    info: 'btn-primary',
    success: 'btn-primary',
  }
  
  const sizeClasses = {
    xs: 'btn-sm',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }
  
  const shapeClasses = {
    circle: '',
    square: '',
  }
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    block ? 'w-full' : '',
    loading ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ')
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="loading-spinner" style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: 'var(--space-2)'
          }}></div>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
