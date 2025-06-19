import React from 'react'

interface FormItemProps {
  children: React.ReactNode
  hidden?: boolean
  flexDirection?: 'column' | 'row'
  className?: string
  error?: boolean
}

export const FormItem: React.FC<FormItemProps> = ({
  children,
  hidden = false,
  flexDirection = 'column',
  className = '',
  error = false,
  ...props
}) => {
  if (hidden) return null
  
  const classes = [
    'form-control',
    'w-full',
    'mb-4',
    flexDirection === 'row' ? 'flex-row items-center gap-4' : 'flex-col',
    error ? 'has-error' : '',
    className
  ].filter(Boolean).join(' ')
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default FormItem
