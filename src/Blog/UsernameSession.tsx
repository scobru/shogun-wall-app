import styled from 'styled-components'
import { useRef, useState } from 'react'
import { Button, Input } from '../Interface'
import { useAuth } from '../utils/AuthContext'
import { AuthButton } from '../components/AuthButton'

const UsernameSessionStyled = styled.div`
   display: flex;
   align-items: center;
   gap: var(--space-2);
   white-space: nowrap;
   
   .username {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-lg);
      background: var(--background-secondary);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--border);
      
      &:hover {
         background: var(--surface-hover);
         border-color: var(--border-hover);
      }
      
      &.authenticated {
         cursor: default;
         
         &:hover {
            background: var(--background-secondary);
            border-color: var(--border);
         }
      }
   }
   
   .auth-status {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-lg);
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 14px;
      font-family: var(--font-sans);
   }
   
   .loading-state {
      padding: var(--space-2) var(--space-3);
      color: var(--text-muted);
      font-size: 14px;
      font-family: var(--font-sans);
      font-style: italic;
   }
   
   .shogun-badge {
      font-size: 11px;
      color: var(--success-500);
      font-weight: 600;
      background: color-mix(in srgb, var(--success-500) 10%, transparent);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-full);
      border: 1px solid color-mix(in srgb, var(--success-500) 20%, transparent);
   }
   
   .error-message {
      color: var(--error-500);
      font-size: 12px;
      font-family: var(--font-sans);
      margin-top: var(--space-1);
      padding: var(--space-1) var(--space-2);
      background: color-mix(in srgb, var(--error-500) 10%, transparent);
      border-radius: var(--radius-md);
      border: 1px solid color-mix(in srgb, var(--error-500) 20%, transparent);
   }
   
   .guest-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
   }
   
   .separator {
      color: var(--text-muted);
      font-size: 12px;
      font-family: var(--font-sans);
   }
   
   .edit-form {
      display: flex;
      align-items: center;
      gap: var(--space-2);
   }
   
   input {
      min-width: 180px;
      max-width: 220px;
   }

   .shogun-auth-container {
      display: flex;
      align-items: center;
      gap: var(--space-2);
   }
`

//TODO https://whimsical.com/vision-9EnTE6UhsnhaSzDzEYkCLr
export const UsernameSession = () => {
   const [editMode, setEditMode] = useState<boolean>(false)
   const usernameRef = useRef<HTMLInputElement>(null)
   
   // Hook per l'autenticazione unificata
   const auth = useAuth()

   const onSave = () => {
      if (!usernameRef.current) {
         return
      }
      auth.setLocalUsername(usernameRef.current.value)
      setEditMode(false)
   }
   const toggleEdit = () => {
      setEditMode((editMode) => !editMode)
   }

   const handleUserKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
         onSave()
      }
   }
   /***
    * TODO && REMINDER
    *  you always think you don't need react hook form
    *  and then you want something as simple as extracting
    *  the input state and it's default value from submitting
    *  the form. Maybe one day you will learn.
    *
    */
   return (
      <UsernameSessionStyled>
         {/* Se l'utente è autenticato con Shogun, mostra ShogunButton */}
         {auth.isLoggedIn ? (
            <div className="shogun-auth-container">
               <AuthButton />
            </div>
         ) : (
            /* Se non è autenticato con Shogun, mostra le opzioni guest + ShogunButton */
            <>
               {auth.localUsername && !editMode ? (
                  <div className="username" onClick={toggleEdit}>
                     <span>{auth.localUsername}</span>
                     <span style={{ 
                        fontSize: '11px', 
                        color: 'var(--text-muted)',
                        fontStyle: 'italic' 
                     }}>
                        (guest)
                     </span>
                  </div>
               ) : editMode ? (
                  <div className="edit-form">
                     <input
                        className="input input-bordered"
                        placeholder="Guest username"
                        ref={usernameRef}
                        onKeyPress={handleUserKeyPress}
                        defaultValue={auth.localUsername || ''}
                     />
                     <Button variant="primary" size="sm" onClick={onSave}>
                        Save
                     </Button>
                  </div>
               ) : (
                  <div className="guest-actions">
                     <AuthButton />
                     <span className="separator">o</span>
                     <Button variant="outline" size="sm" onClick={toggleEdit}>
                        Guest
                     </Button>
                  </div>
               )}
            </>
         )}
         
         {auth.error && (
            <div className="error-message">
               {auth.error}
            </div>
         )}
      </UsernameSessionStyled>
   )
}

export default UsernameSession
