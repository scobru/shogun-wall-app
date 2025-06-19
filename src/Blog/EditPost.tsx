import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Label, FormItem, Textarea } from '../Interface'
import useUpdateWithAuth from '../api/useUpdateWithAuth'
import { useAuth } from '../utils/AuthContext'
import { useNavigate } from 'react-router-dom'
import Tiptap from '../Interface/TipTap'
import useGet from '../api/useGet'
import { useParams } from 'react-router-dom'
import LoadingWheel from '../Interface/LoadingWheel'

const EditPost = () => {
   const [saveNode, loading, node] = useUpdateWithAuth('post')
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
      setValue('category', post.category)
      setValue('hashtags', post.hashtags ? post.hashtags.replace(/,/g, ' ') : '')
   }, [post])

   useEffect(() => {
      if (post) {
         document.title = `Edit Post ${post.key}`
      } else {
         document.title = 'Edit Post'
      }
   }, [post])

   if (!post) {
      return (
         <div className="flex flex-col items-center p-4">
            <div className="text-lg mb-4">Loading</div>
            <LoadingWheel />
         </div>
      )
   }

   return (
      <div className="edit-post-container">

         {/* Mostra l'utente corrente */}
         <div className="mb-5 p-2.5 bg-base-200 rounded-lg border border-base-300">
            <div className="flex items-center justify-between">
               <div>
            <strong>Modificando come: </strong>
                  <span className={auth.isAuthenticated ? 'text-success' : 'text-base-content/70'}>
               {auth.currentUsername || 'Anonymous'}
               {auth.isAuthenticated && ' (Shogun ✓)'}
                  </span>
               </div>
               {!auth.hasAnyAuth && (
                     <Button 
                        onClick={auth.redirectToAuth} 
                     size="xs"
                     variant="primary"
                     >
                        Accedi con Shogun
                     </Button>
               )}
            </div>
         </div>

         <FormItem error={!!errors['key']}>
            <Label required>
               Slug:
            </Label>
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
         </FormItem>

         <FormItem error={!!errors['title']}>
            <Label required>
               Title:
            </Label>
            <Input {...register('title', { required: true })} />
         </FormItem>

         <FormItem error={!!errors['description']}>
            <Label required>
               Description:
            </Label>
            <Textarea {...register('description', { required: true })} />
         </FormItem>

         <FormItem error={!!errors['url']}>
            <Label>
               URL (og-link):
            </Label>
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
            <div className="text-xs text-base-content/70 mt-1">
               Inserisci un URL per aggiungere un og-link al post
            </div>
         </FormItem>

         <FormItem error={!!errors['image']}>
            <Label>
               Image (url/blob):
            </Label>
               <Input {...register('image', { required: false })} />
         </FormItem>

         <FormItem error={!!errors['category']}>
            <Label>
               Categoria:
            </Label>
            <Input 
               {...register('category', { required: false })} 
               placeholder="es. Tech, Lifestyle, Tutorial"
            />
            <div className="text-xs text-base-content/70 mt-1">
               Categoria principale del post (opzionale)
            </div>
         </FormItem>

         <FormItem error={!!errors['hashtags']}>
            <Label>
               Hashtags:
            </Label>
            <Input 
               {...register('hashtags', { required: false })} 
               placeholder="#react #typescript #webdev"
            />
            <div className="text-xs text-base-content/70 mt-1">
               Hashtags separati da spazi (es: #react #tutorial #webdev)
            </div>
         </FormItem>

         <FormItem
            error={!!errors['content']}
            flexDirection="column"
         >
            <Label required>Content:</Label>
            <Tiptap
               onChange={(value) => setValue('content', value)}
               content={post.content}
            />
         </FormItem>

         <Button
            disabled={loading || Object.keys(errors).length > 0}
            onClick={handleSubmit(saveNode)}
            loading={loading}
            className="w-full"
         >
            {!loading && 'Save'}
            {loading && 'Loading'}
         </Button>
      </div>
   )
}

export default EditPost
