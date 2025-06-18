import { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useForm } from 'react-hook-form'
import { Button, Input, Label, FormItem, Textarea } from '../Interface'
import useUpdateWithAuth from '../api/useUpdateWithAuth'
import { useAuth } from '../utils/AuthContext'
import { useNavigate } from 'react-router-dom'
import Tiptap from '../Interface/TipTap'
import styled from 'styled-components'

const NewPostStyled = styled.div`
   display: flex;
   flex-direction: column;
`

const NewPost = () => {
   const [createNode, loading, node] = useUpdateWithAuth('post')
   const navigate = useNavigate()
   const auth = useAuth()
   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
   } = useForm()

   useEffect(() => {
      if (!loading && node) {
         navigate('/blog')
      }
   }, [loading, node])

   useEffect(() => {
      register('content', { required: true })
   }, [])

   return (
      <NewPostStyled>
         <Helmet title="New Post" />
         
         {/* Mostra l'utente corrente */}
         <div style={{ 
            marginBottom: '20px', 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '5px',
            border: '1px solid #ddd'
         }}>
            <strong>Pubblicando come: </strong>
            <span style={{ color: auth.isAuthenticated ? '#4CAF50' : '#666' }}>
               {auth.currentUsername || 'Anonymous'}
               {auth.isAuthenticated && ' (Shogun ✓)'}
               {!auth.hasAnyAuth && (
                  <span style={{ marginLeft: '10px' }}>
                     <Button 
                        onClick={auth.redirectToAuth} 
                        style={{ fontSize: '12px', padding: '2px 8px' }}
                     >
                        Accedi con Shogun
                     </Button>
                  </span>
               )}
            </span>
         </div>

         <FormItem className={errors['title'] ? 'error' : ''}>
            <Label>
               Title:
               <Input {...register('title', { required: true })} />
            </Label>
         </FormItem>

         <FormItem
            className={errors['content'] ? 'error' : ''}
            flexDirection="column"
         >
            <Label>Content:</Label>I
            <Tiptap
               onChange={(value) => setValue('content', value)}
               content="<h1>Title</h1>"
            />
         </FormItem>

         <FormItem className={errors['key'] ? 'error' : ''}>
            <Label>
               Slug:
               <Input
                  {...register('key', {
                     required: true,
                     validate: {
                        nospaces: (value) =>
                           !value.match(/\s/) ||
                           'The url should not contain spaces.',
                     },
                  })}
               />
            </Label>
         </FormItem>

         <FormItem className={errors['description'] ? 'error' : ''}>
            <Label>
               Description:
               <Textarea {...register('description', { required: true })} />
            </Label>
         </FormItem>

         <FormItem className={errors['url'] ? 'error' : ''}>
            <Label>
               URL (og-link):
               <Input 
                  {...register('url', { 
                     required: false,
                     pattern: {
                        value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                        message: 'Please enter a valid URL'
                     }
                  })} 
                  placeholder="https://example.com"
               />
            </Label>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
               Inserisci un URL per aggiungere un og-link al post
            </div>
         </FormItem>

         <FormItem className={errors['image'] ? 'error' : ''}>
            <Label>
               Image (url/blob):
               <Input {...register('image', { required: true })} />
            </Label>
         </FormItem>

         <Button
            disabled={loading || errors.length}
            onClick={handleSubmit(createNode)}
         >
            {!loading && 'Create'}
            {loading && 'Loading'}
         </Button>
      </NewPostStyled>
   )
}

export default NewPost
