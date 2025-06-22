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
         ? (auth.username || 'shogun_user')
         : (auth.currentUsername || getRandomUsername())
      )
      // Register URL field explicitly
      register('url', { required: false })
   }, [auth.isAuthenticated, auth.userPub, auth.currentUsername, register])

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

   // Debug function to wrap createNode
   const createNodeWithDebug = (data: any) => {
      console.log('🔥 NEW NODE: Form submitted with data:', data)
      console.log('🔗 NEW NODE: URL field specifically:', {
         url: data.url,
         urlType: typeof data.url,
         urlLength: data.url ? data.url.length : 0,
         isEmpty: !data.url || data.url.trim() === ''
      })
      createNode(data)
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
                  ? (auth.username || 'Shogun User')
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
               {...register('directionText')}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray(['Title'])}
            />
         </FormItem>

         {/* Start (if in dashboard mode) */}
         <FormItem hidden={!props.dashboardFeature && !showAdvanced}>
            <Input
               {...register('start')}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray(['Start', 'Pre'])}
            />
         </FormItem>
         {/* End (if in dashboard mode) */}
         <FormItem hidden={!props.dashboardFeature}>
            <Input
               {...register('end')}
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
         
         {/* Campi avanzati - nascosti per i commenti */}
         {!props.head && (
            <>
               {/* URL per og-link */}
               <FormItem className={errors['url'] ? 'error' : ''}>
                  <Label>URL (og-link):</Label>
                  <Input
                     {...register('url')}
                     onKeyPress={handleUserKeyPress}
                     placeholder="https://example.com"
                  />
                  <div style={{ 
                     marginTop: '4px', 
                     fontSize: '12px', 
                     color: '#6c757d',
                     padding: '4px'
                  }}>
                     Inserisci un URL esterno da mostrare come og-link
                  </div>
               </FormItem>

               {/* Categoria */}
               <FormItem className={errors['category'] ? 'error' : ''}>
                  <Label>Categoria:</Label>
                  <Input
                     {...register('category')}
                     onKeyPress={handleUserKeyPress}
                     placeholder="es. Tech, Ideas, Discussion"
                  />
                  <div style={{ 
                     marginTop: '4px', 
                     fontSize: '12px', 
                     color: '#6c757d',
                     padding: '4px'
                  }}>
                     Categoria principale del nodo (opzionale)
                  </div>
               </FormItem>

               {/* Hashtags */}
               <FormItem className={errors['hashtags'] ? 'error' : ''}>
                  <Label>Hashtags:</Label>
                  <Input
                     {...register('hashtags')}
                     onKeyPress={handleUserKeyPress}
                     placeholder="#idea #discussion #brainstorm"
                  />
                  <div style={{ 
                     marginTop: '4px', 
                     fontSize: '12px', 
                     color: '#6c757d',
                     padding: '4px'
                  }}>
                     Hashtags separati da spazi (es: #idea #tech #discussion)
                  </div>
               </FormItem>
            </>
         )}

         {/* Per i commenti, mostra solo URL opzionale */}
         {props.head && (
            <FormItem className={errors['url'] ? 'error' : ''}>
               <details style={{ marginBottom: '8px' }}>
                  <summary style={{ 
                     cursor: 'pointer', 
                     fontSize: '12px', 
                     color: '#6c757d',
                     marginBottom: '8px'
                  }}>
                     🔗 Aggiungi link (opzionale)
                  </summary>
                  <Input
                     {...register('url')}
                     onKeyPress={handleUserKeyPress}
                     placeholder="https://example.com"
                     style={{ marginTop: '8px' }}
                  />
               </details>
            </FormItem>
         )}
         
         {/*  ID - nascosto per i commenti */}
         <FormItem
            hidden={!!(showAdvanced || props.head)}
            className={errors['id'] ? 'error' : ''}
         >
            <Input
               {...register('id')}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray(['Id', 'HashKey', 'Path'])}
            />
         </FormItem>
         {/* Head */}
         <FormItem hidden={!showAdvanced}>
            <Input
               {...register('head')}
               onKeyPress={handleUserKeyPress}
               placeholder={getRandomFromArray(['Previous', 'Parent'])}
            />
         </FormItem>
         {/* User - nascosto per i commenti se autenticato */}
         <FormItem 
            className={errors['user'] ? 'error' : ''}
            hidden={!!(auth.isAuthenticated || props.head)} // Nascondi se autenticato O se è un commento
         >
            <Input
               {...register('user')}
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
                  <strong>User ID:</strong> {auth.userPubFormatted || ''}
               </div>
            </FormItem>
         )}
         {/* Submit */}
         <FormItem>
            <Button
               /* @ts-ignore */
               disabled={loading || errors.length}
               onClick={handleSubmit(createNodeWithDebug as SubmitHandler<FieldValues>)}
            >
               {loading 
                  ? 'Invio...' 
                  : props.head 
                     ? 'Pubblica Commento' 
                     : getRandomFromArray(['Add', 'Create'])
               }
            </Button>
         </FormItem>
      </Wrapper>
   )
}

export default NewNode
