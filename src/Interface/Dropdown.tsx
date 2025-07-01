import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type ILink = {
   path: string
   text: string
}

type DropdownProps = {
   links: ILink[]
   children: React.ReactChild
}

export const DropDown = ({ links, children }: DropdownProps) => {
   const [open, setOpen] = useState(false)
   const navigate = useNavigate()
   const ref = useRef<any>(null)

   // Setup on click listeners to close dropdowns
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (ref.current && !ref.current.contains(event.target)) {
            setOpen(false)
         }
      }
      document.addEventListener('click', handleClickOutside, true)
      return () => {
         document.removeEventListener('click', handleClickOutside, true)
      }
   }, [])

   const topClicked = (e) => {
      e.preventDefault()
      navigate(links[0].path)
   }

   const topDoubleClicked = (e) => {
      e.preventDefault()
      setOpen((open) => !open)
   }

   return (
      <div
         ref={ref}
         className="dropdown-container"
         style={{ position: 'relative' }}
      >
         <div className="top">
            <a 
               onClick={topClicked} 
               onDoubleClick={topDoubleClicked}
               style={{
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  minWidth: '20px',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  cursor: 'pointer'
               }}
            >
               {children}
            </a>
         </div>
         {open && (
            <div className="dropdown-menu" style={{
               position: 'absolute',
               zIndex: 3,
               display: 'flex',
               flexDirection: 'column',
               minWidth: '120px',
               marginTop: 'var(--space-2)',
               padding: 'var(--space-2)',
               borderRadius: 'var(--radius-lg)',
               backgroundColor: 'var(--surface)',
               boxShadow: 'var(--shadow-lg)',
               border: '1px solid var(--border)'
            }}>
               {links.map(({ path, text }, index) => {
                  return (
                     <Link key={index} to={path} className="dropdown-item">
                        {text}
                     </Link>
                  )
               })}
            </div>
         )}
      </div>
   )
}
