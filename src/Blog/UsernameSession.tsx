import styled from 'styled-components'
import { useRef, useState } from 'react'
import { Button, Input } from '../Interface'
import { useAuth } from '../utils/AuthContext'

const UsernameSessionStyled = styled.div`
   display: flex;
   align-items: center;
   .username {
      padding: 8px 0px 5px 17px;
      text-decoration: underline dotted;
      cursor: pointer;
   }
   button {
      height: 100%;
      margin-left: 5px;
   }
   input {
      padding-left: 10px;
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
         {auth.loading ? (
            <div style={{ padding: '8px 17px 5px 17px', color: '#666' }}>
               Caricamento...
            </div>
         ) : auth.hasAnyAuth && !editMode ? (
            <div className="username" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span onClick={!auth.isAuthenticated ? toggleEdit : undefined} style={{ 
                 cursor: !auth.isAuthenticated ? 'pointer' : 'default',
                 textDecoration: !auth.isAuthenticated ? 'underline dotted' : 'none'
               }}>
                  {auth.currentUsername}
                  {auth.isAuthenticated && (
                     <span style={{ fontSize: '0.7em', color: '#4CAF50', marginLeft: '4px' }}>
                        (Shogun ✓)
                     </span>
                  )}
               </span>
               {auth.isAuthenticated ? (
                  <Button onClick={auth.logout} style={{ fontSize: '12px', padding: '2px 8px' }}>
                     Logout
                  </Button>
               ) : (
                  <Button onClick={auth.redirectToAuth} style={{ fontSize: '12px', padding: '2px 8px' }}>
                     Auth
                  </Button>
               )}
            </div>
         ) : !auth.hasAnyAuth ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Button onClick={auth.redirectToAuth}>
                  Accedi con Shogun
               </Button>
               <span style={{ color: '#666', fontSize: '12px' }}>o</span>
               <Button onClick={toggleEdit} style={{ fontSize: '12px' }}>
                  Guest
               </Button>
            </div>
         ) : editMode ? (
            <>
               <input
                  placeholder="username:password"
                  ref={usernameRef}
                  onKeyPress={handleUserKeyPress}
               />
               <Button onClick={onSave}>Save</Button>
            </>
         ) : null}
         
         {auth.error && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
               {auth.error}
            </div>
         )}
      </UsernameSessionStyled>
   )
}

export default UsernameSession
