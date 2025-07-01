import { FC } from 'react'

const LoadingWheel: FC<{ className?: string }> = ({ className }) => {
   const classes = ['loading-spinner', className].filter(Boolean).join(' ')
   return <div className={classes} />
}

export default LoadingWheel
