import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Label, FormItem, Textarea } from '../Interface'
import useUpdateWithAuth from '../api/useUpdateWithAuth'
import { useAuth } from '../utils/AuthContext'
import { useNavigate } from 'react-router-dom'
import Tiptap from '../Interface/TipTap'

const NewPost = () => {
   const [saveNode, loading, node] = useUpdateWithAuth('post')
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

   useEffect(() => {
      document.title = 'New Post'
   }, [])

   return (
      <div className="new-post-container">
         
         {/* User Info Card */}
         <div className="card bg-base-200 border border-base-300 p-4 mb-6">
            <div className="flex items-center justify-between">
               <div>
                  <span className="font-semibold">Pubblicando come: </span>
                  <span className={`font-medium ${auth.isAuthenticated ? 'text-success' : 'text-base-content'}`}>
                     {auth.currentUsername || 'Anonymous'}
                     {auth.isAuthenticated && ' (Shogun ✓)'}
                  </span>
               </div>
               {!auth.hasAnyAuth && (
                  <Button 
                     onClick={auth.redirectToAuth} 
                     size="sm"
                     variant="primary"
                  >
                     Accedi con Shogun
                  </Button>
               )}
            </div>
         </div>

         <FormItem error={!!errors['title']}>
            <Label required>Title:</Label>
            <Input {...register('title', { required: true })} placeholder="Inserisci il titolo del post..." />
            {errors['title'] && <div className="text-error text-xs mt-1">Il titolo è obbligatorio</div>}
         </FormItem>

         <FormItem
            error={!!errors['content']}
            flexDirection="column"
         >
            <Label required>Content:</Label>
            <Tiptap
               onChange={(value) => setValue('content', value)}
               content="<h1>Title</h1>"
            />
            {errors['content'] && <div className="text-error text-xs mt-1">Il contenuto è obbligatorio</div>}
         </FormItem>

         <FormItem error={!!errors['key']}>
            <Label required>Slug:</Label>
            <Input
               {...register('key', {
                  required: 'Lo slug è obbligatorio',
                  validate: {
                     nospaces: (value) =>
                        !value.match(/\s/) ||
                        'Lo slug non può contenere spazi.',
                  },
               })}
               placeholder="url-slug-del-post"
            />
            {errors['key'] && (
               <div className="text-error text-xs mt-1">
                  {errors['key']?.message as string}
               </div>
            )}
         </FormItem>

         <FormItem error={!!errors['description']}>
            <Label required>Description:</Label>
            <Textarea 
               {...register('description', { required: 'La descrizione è obbligatoria' })} 
               placeholder="Breve descrizione del post..."
               rows={3}
            />
            {errors['description'] && (
               <div className="text-error text-xs mt-1">
                  {errors['description']?.message as string}
               </div>
            )}
         </FormItem>

         <FormItem error={!!errors['url']}>
            <Label>URL (og-link):</Label>
            <Input 
               {...register('url', { 
                  required: false,
                  pattern: {
                     value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                     message: 'Inserisci un URL valido'
                  }
               })} 
               placeholder="https://example.com"
            />
            <div className="text-xs text-base-content/70 mt-1">
               Inserisci un URL per aggiungere un og-link al post
            </div>
            {errors['url'] && (
               <div className="text-error text-xs mt-1">
                  {errors['url']?.message as string}
               </div>
            )}
         </FormItem>

         <FormItem error={!!errors['image']}>
            <Label>Image (url/blob):</Label>
            <Input 
               {...register('image', { required: false })} 
               placeholder="https://example.com/image.jpg"
            />
         </FormItem>

         <FormItem error={!!errors['category']}>
            <Label>Categoria:</Label>
            <Input 
               {...register('category', { required: false })} 
               placeholder="es. Tech, Lifestyle, Tutorial"
            />
            <div className="text-xs text-base-content/70 mt-1">
               Categoria principale del post (opzionale)
            </div>
         </FormItem>

         <FormItem error={!!errors['hashtags']}>
            <Label>Hashtags:</Label>
            <Input 
               {...register('hashtags', { required: false })} 
               placeholder="#react #typescript #webdev"
            />
            <div className="text-xs text-base-content/70 mt-1">
               Hashtags separati da spazi (es: #react #tutorial #webdev)
            </div>
         </FormItem>

         <div className="flex gap-3 pt-6">
            <Button
               variant="primary"
               disabled={loading || Object.keys(errors).length > 0}
               onClick={handleSubmit((data) => {
                  // Clean the data before sending to avoid Gun.js errors
                  const cleanedData = {
                     ...data,
                     title: data.title || '',
                     content: data.content || '',
                     key: data.key || '',
                     description: data.description || '',
                     url: data.url || undefined,
                     image: data.image || undefined,
                     category: data.category || undefined,
                     hashtags: data.hashtags || undefined
                  }
                  
                  // Remove undefined/empty fields
                  Object.keys(cleanedData).forEach(key => {
                     if (cleanedData[key] === undefined || cleanedData[key] === null || cleanedData[key] === '') {
                        if (['title', 'content', 'key', 'description'].includes(key)) {
                           // Required fields should have default values, not be deleted
                           return
                        }
                        delete cleanedData[key]
                     }
                  })
                  
                  console.log('🏗️ Cleaned data before submission:', cleanedData)
                  saveNode(cleanedData)
               })}
               loading={loading}
               className="flex-1"
            >
               {!loading && 'Crea Post'}
               {loading && 'Creazione in corso...'}
            </Button>
            <Button
               variant="outline"
               onClick={() => navigate('/blog')}
               disabled={loading}
            >
               Annulla
            </Button>
         </div>
      </div>
   )
}

export default NewPost
