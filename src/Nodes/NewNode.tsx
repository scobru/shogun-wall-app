import { DungeonNode, GunId } from '.'
import React, { useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { getRandomUsername, IdTypes, makeId } from '../utils'
import Tiptap from '../Interface/TipTap'
import { getRandomFromArray } from '../utils'
import { Wrapper, FormItem } from './NewNode.styled'
import useKeyboard from '../utils/useKeyboard'
import Input from '../Interface/Input'
import { Button, Label, Textarea } from 'Interface'
import useCreateNodeWithAuth from './useCreateNodeWithAuth'
import { useAuth } from '../utils/AuthContext'

export type NewSubNodeProps = {
   head?: GunId
   dashboardFeature?: boolean
   nodeAdded: (node: DungeonNode) => void
}

const NewNode = (props: NewSubNodeProps) => {
   const [showAdvanced, showShowAdvanced] = useState(false)
   const [createNode, loading] = useCreateNodeWithAuth(props.nodeAdded)
   const auth = useAuth()

   const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
   } = useForm()
   const keypressed = useKeyboard(['v'])

   useEffect(() => {
      document.title = `Something new!`
      setValue('head', props.head || null)
      setValue('message', undefined)
      setValue('id', makeId(7, [IdTypes.lower, IdTypes.numbers]))
      // Usa l'utente autenticato invece di uno random
      setValue('user', auth.isAuthenticated 
         ? (auth.userPub || auth.currentUsername || 'shogun_user')
         : (auth.currentUsername || getRandomUsername())
      )
   }, [auth.isAuthenticated, auth.userPub, auth.currentUsername])

   useEffect(() => {
      if (keypressed === 'v') {
         showShowAdvanced((showAdvanced) => !showAdvanced)
      }
   }, [keypressed])

   const handleUserKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
         e.preventDefault()
         handleSubmit(createNode as SubmitHandler<FieldValues>)()
      }
   }

   return (
      <Wrapper>
         {/* Info autenticazione */}
         <div style={{ 
            marginBottom: '15px', 
            padding: '8px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '13px',
            border: '1px solid #dee2e6'
         }}>
            <strong>Creando come: </strong>
            <span style={{ color: auth.isAuthenticated ? '#28a745' : '#6c757d' }}>
               {auth.isAuthenticated 
                  ? (auth.userPub?.substring(0, 12) + '...' || auth.currentUsername || 'Shogun User')
                  : (auth.currentUsername || 'Guest User')
               }
               {auth.isAuthenticated && (
                  <span style={{ marginLeft: '6px', color: '#28a745' }}>✓ Shogun</span>
               )}
            </span>
            {!auth.hasAnyAuth && (
               <span style={{ marginLeft: '10px' }}>
                  <Button 
                     onClick={auth.redirectToAuth} 
                     style={{ fontSize: '11px', padding: '2px 6px' }}
                  >
                     Accedi
                  </Button>
               </span>
            )}
         </div>
         
         {/* Subject line */}
         <FormItem
            hidden={!!props.head}
            className={errors['directionText'] ? 'error' : ''}
         >
            <Input
               register={register}
               name={'directionText'}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray(['Title'])}
            />
         </FormItem>

         {/* Start (if in dashboard mode) */}
         <FormItem hidden={!props.dashboardFeature && !showAdvanced}>
            <Input
               register={register}
               name={'start'}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray(['Start', 'Pre'])}
            />
         </FormItem>
         {/* End (if in dashboard mode) */}
         <FormItem hidden={!props.dashboardFeature}>
            <Input
               register={register}
               name={'end'}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray(['End', 'Post'])}
            />
         </FormItem>
         {/* Message (if in reply mode) */}
         <FormItem
            hidden={!props.head}
            className={errors['message'] ? 'error' : ''}
         >
            <Textarea
               onChange={(event) => setValue('message', event.target.value)}
               name={'message'}
               autoFocus={true}
               onKeyPress={handleUserKeyPress}
               placeholder={'what are your thoughts?'}
            />
         </FormItem>
         {/* Message (if in parent mode) */}
         <FormItem
            hidden={!!props.head}
            className={errors['message'] ? 'error' : ''}
         >
            <Tiptap
               placeholder={'Message'}
               onChange={(value) => setValue('message', value)}
               content={''}
            />
         </FormItem>
         {/*  ID */}
         <FormItem
            hidden={showAdvanced}
            className={errors['id'] ? 'error' : ''}
         >
            <Input
               register={register}
               name={'id'}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray(['Id', 'HashKey', 'Path'])}
            />
         </FormItem>
         {/* Head */}
         <FormItem hidden={!showAdvanced}>
            <Input
               register={register}
               name={'head'}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray(['Previous', 'Parent'])}
            />
         </FormItem>
         {/* User */}
         <FormItem 
            className={errors['user'] ? 'error' : ''}
            hidden={auth.isAuthenticated} // Nascondi se autenticato
         >
            <Input
               register={register}
               name={'user'}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray([
                  'User ID',
                  'Username',
                  'Handle',
               ])}
            />
         </FormItem>
         
         {/* Mostra info user se autenticato */}
         {auth.isAuthenticated && (
            <FormItem>
               <div style={{ 
                  padding: '8px', 
                  backgroundColor: '#e9f7ef', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#155724'
               }}>
                  <strong>User ID:</strong> {auth.userPub?.substring(0, 20)}...
               </div>
            </FormItem>
         )}
         {/* Submit */}
         <FormItem>
            <Button
               /* @ts-ignore */
               disabled={loading || errors.length}
               onClick={handleSubmit(createNode as SubmitHandler<FieldValues>)}
            >
               {getRandomFromArray(['Add', 'Create'])}
            </Button>
         </FormItem>
      </Wrapper>
   )
}

export default NewNode
