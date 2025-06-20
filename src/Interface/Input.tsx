import { forwardRef } from 'react'

const Input = forwardRef<
   HTMLInputElement,
   React.InputHTMLAttributes<HTMLInputElement>
>(({ className = '', ...props }, ref) => {
   const classes = [
      'input',
      'input-bordered',
      className
   ].filter(Boolean).join(' ')

   return <input className={classes} {...props} ref={ref} />
})

Input.displayName = 'Input'

export default Input
