import React from 'react'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  required?: boolean
  disabled?: boolean
}

export const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const classes = [
    'label',
    disabled ? 'opacity-50' : '',
    className
  ].filter(Boolean).join(' ')
  
  return (
    <label className={classes} {...props}>
      <span className="label-text">
        {children}
        {required && <span className="text-error ml-1">*</span>}
      </span>
    </label>
  )
}

export default Label
