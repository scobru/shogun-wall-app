import { useEffect } from 'react'
import Helmet from 'react-helmet'
import { useForm } from 'react-hook-form'
import { Button, Input, Label, FormItem, Textarea } from '../Interface'
import useUpdateWithAuth from '../api/useUpdateWithAuth'
import { useAuth } from '../utils/AuthContext'
import { useNavigate } from 'react-router-dom'
import Tiptap from '../Interface/TipTap'
import useGet from '../api/useGet'
import { useParams } from 'react-router-dom'
import LoadingWheel from '../Interface/LoadingWheel'
import styled from 'styled-components'

const EditPostStyled = styled.div`
   display: flex;
   flex-direction: column;
`

const EditPost = () => {
   const [createNode, loading, node] = useUpdateWithAuth('post')
   const params = useParams()
   const key = params.key
   const post = useGet(key, 'post', true)
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
         navigate(`/blog/${node.key}`)
      }
   }, [loading, node])

   useEffect(() => {
      if (!post) {
         return
      }
      setValue('content', post.content)
      setValue('key', post.key)
      setValue('title', post.title)
      setValue('description', post.description)
      setValue('url', post.url)
      setValue('image', post.image)
   }, [post])

   if (!post) {
      return (
         <>
            <Helmet>
               <title>Edit Post</title>
            </Helmet>
            Loading
            <LoadingWheel />
         </>
      )
   }

   return (
      <EditPostStyled>
         <Helmet>
            <title>Edit Post {post?.key}</title>
         </Helmet>

         {/* Mostra l'utente corrente */}
         <div style={{ 
            marginBottom: '20px', 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '5px',
            border: '1px solid #ddd'
         }}>
            <strong>Modificando come: </strong>
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

         <FormItem className={errors['title'] ? 'error' : ''}>
            <Label>
               Title:
               <Input {...register('title', { required: true })} />
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
               <Input {...register('image', { required: false })} />
            </Label>
         </FormItem>

         <FormItem
            className={errors['content'] ? 'error' : ''}
            flexDirection="column"
         >
            <Label>Content:</Label>
            <Tiptap
               onChange={(value) => setValue('content', value)}
               content={post.content}
            />
         </FormItem>

         <Button
            disabled={loading || errors.length}
            onClick={handleSubmit(createNode)}
         >
            {!loading && 'Save'}
            {loading && 'Loading'}
         </Button>
      </EditPostStyled>
   )
}

export default EditPost
