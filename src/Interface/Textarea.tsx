import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
   className?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
   ({ className = '', ...props }, ref) => {
      const classes = [
         'input', // Use same styling as input
         'input-bordered',
         className
      ].filter(Boolean).join(' ')

      return <textarea ref={ref} className={classes} {...props} />
   }
)

Textarea.displayName = 'Textarea'

export default Textarea
