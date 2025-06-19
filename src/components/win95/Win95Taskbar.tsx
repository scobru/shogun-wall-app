import React, { useState, useEffect } from 'react'

interface TaskbarProps {
   onStartClick?: () => void
   showHalEye?: boolean
}

export const Win95Taskbar: React.FC<TaskbarProps> = ({ 
   onStartClick,
   showHalEye = true 
}) => {
   const [currentTime, setCurrentTime] = useState(new Date())

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentTime(new Date())
      }, 1000)

      return () => clearInterval(timer)
   }, [])

   const formatTime = (date: Date) => {
      return date.toLocaleTimeString('it-IT', {
         hour: '2-digit',
         minute: '2-digit',
         hour12: false
      })
   }

   return (
      <div className="taskbar">
         {/* Start Button */}
         <button 
            className="start-button"
            onClick={onStartClick}
            title="Start Menu"
         >
            Start
         </button>

         {/* Separator */}
         <div className="separator"></div>

         {/* HAL 9000 Eye Integration */}
         {showHalEye && (
            <div className="hal-eye-container" style={{ 
               margin: '0 8px',
               padding: '2px 6px',
               height: '22px',
               display: 'flex',
               alignItems: 'center'
            }}>
               <div className="hal-eye" style={{ 
                  width: '16px', 
                  height: '16px',
                  marginRight: '6px'
               }}></div>
               <span className="hal-eye-text" style={{ 
                  fontSize: '9px',
                  letterSpacing: '1px'
               }}>
                  HAL.9000
               </span>
            </div>
         )}

         {/* System Tray (Clock) */}
         <div className="clock">
            {formatTime(currentTime)}
         </div>
      </div>
   )
}

export default Win95Taskbar 