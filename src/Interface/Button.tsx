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
    accent: 'btn-accent',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    error: 'btn-error',
    warning: 'btn-warning',
    info: 'btn-info',
    success: 'btn-success',
  }
  
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }
  
  const shapeClasses = {
    circle: 'btn-circle',
    square: 'btn-square',
  }
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    shape ? shapeClasses[shape] : '',
    block ? 'btn-block' : '',
    loading ? 'loading' : '',
    className
  ].filter(Boolean).join(' ')
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs mr-2"></span>
      ) : null}
      {children}
    </button>
  )
}

export default Button
