import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useListen from '../api/useListen'
import useDelete from '../api/useDelete'
import { useAuth } from '../utils/AuthContext'
import { createMarkup } from '../utils'
import usePostClicked from './usePostClicked'
import { getRandomFromArray } from '../utils'
import { DungeonNode } from 'Nodes'
import { formatPublicKey, formatAuthorDisplay } from '../utils/usernameMap'
import { parseHashtags, formatHashtagForDisplay } from '../utils/hashtagUtils'
import OGLinkPreview from '../components/OGLinkPreview'

/*
#3ed3c9
#f8633c
#5970cd
#f4d400
*/

const colors = ['#3ed3c9', '#f8633c', '#5970cd', '#f4d400']

const ViewPost: React.FC = () => {
   const { key = '' } = useParams()
   const [tempContent, setTempContent] = useState<string>(null!)
   const post = useListen(key, 'post', true) as DungeonNode
   const postClicked = usePostClicked()
   const [deletePost] = useDelete('post', true)
   const auth = useAuth()
   const navigate = useNavigate()
   
   const borderColor: string = useMemo(
      () => getRandomFromArray(colors),
      [post?.title]
   )

   const getPreloadData = (): void => {
      const content: HTMLMetaElement | null = document.querySelector(
         'meta[name="content"]'
      )
      if (!content?.content) {
         return
      }
      setTempContent(decodeURI(content?.content))
   }

   useEffect(() => {
      const description: HTMLMetaElement | null = document.querySelector(
         'meta[name="description"]'
      )
      if (description?.content === `__META_OG_DESCRIPTION__`) {
         // if the SSR is in effect, this field will be altered from the template html file
         document.title = post?.title || 'Title is missing'
      } else {
         getPreloadData()
      }
   }, [post?.title])

   // Formatta la data
   const formatDate = (timestamp: number | string) => {
      if (!timestamp) return 'Data sconosciuta'
      return new Date(Number(timestamp)).toLocaleDateString('it-IT', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   // Verifica se l'utente può modificare/cancellare il post
   const canEditPost = (post: DungeonNode) => {
      if (!post) return false
      // Se l'utente è autenticato con Shogun, può modificare solo i suoi post
      if (auth.isAuthenticated) {
         return post.userPub === auth.userPub || post.user === auth.username
      }
      // Se è guest, può modificare solo i post con lo stesso username locale
      return post.user === auth.currentUsername
   }

   // Funzione per cancellare il post
   const handleDelete = () => {
      if (window.confirm('Sei sicuro di voler eliminare questo post?')) {
         console.log(`🗑️ Cancellazione post: ${key}` )
         // Passa i parametri di autenticazione corretti
         deletePost(key, auth.userPub || undefined, auth.currentUsername || undefined)
         navigate('/blog') // Torna alla lista dei post
      }
   }

   // Funzione per modificare il post
   const handleEditPost = () => {
      navigate(`/post/edit/${key}`)
   }

   // Funzione per tornare alla lista
   const handleBackToBlog = () => {
      navigate('/blog')
   }

   if (!post) {
      return (
         <div className="post-container">
            <div className="text-center py-20">
               <h3 className="text-xl font-semibold mb-4">Caricamento post...</h3>
            </div>
         </div>
      )
   }

   return (
      <div className="post-container max-w-4xl mx-auto">
         {/* Header di navigazione */}
         <div className="flex justify-between items-center mb-6 pb-4 border-b border-base-300">
            <button 
               className="btn btn-outline btn-sm"
               onClick={handleBackToBlog}
               title="Torna al blog"
            >
               ← Torna al Blog
            </button>
            
            {canEditPost(post) && (
               <div className="flex gap-2">
                  <button 
                     className="btn btn-primary btn-sm"
                     onClick={handleEditPost}
                     title="Modifica post"
                     style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                     </svg>
                     Modifica
                  </button>
                  <button 
                     className="btn btn-error btn-sm"
                     onClick={handleDelete}
                     title="Cancella post"
                     style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                     </svg>
                     Elimina
                  </button>
               </div>
            )}
         </div>

         {/* Post principale */}
         <article className="post-card">
            {/* Titolo del post */}
            <header className="mb-6">
               <h1 className="text-3xl font-bold text-base-content mb-4 leading-tight">
                  {post.title || 'Post senza titolo'}
               </h1>

               {/* Metadati autore */}
               <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/70 mb-4">
                  <div className="flex items-center gap-2">
                     <span 
                        className="font-semibold text-base-content cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/profile/${encodeURIComponent(post.user || 'anonymous')}`)}
                        title={`Vedi tutti i contenuti di ${formatAuthorDisplay(post.user)}`}
                        style={{ textDecoration: 'underline' }}
                     >
                        {formatAuthorDisplay(post.user)}
                     </span>
                     {post.userType === 'shogun' && (
                        <span className="badge badge-success badge-xs">SHOGUN</span>
                     )}
                     {post.userType === 'guest' && (
                        <span className="badge badge-neutral badge-xs">GUEST</span>
                     )}
                     {!post.userType && post.user && (
                        <span className="badge badge-neutral badge-xs">LEGACY</span>
                     )}
                  </div>
                  <span className="text-base-content/50">•</span>
                  <time className="text-base-content/60" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                     </svg>
                     {formatDate(post.timestamp || post.date)}
                  </time>
               </div>

               {/* Categoria e Tags */}
               {(post.category || post.hashtags) && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                     {post.category && (
                        <div className="flex items-center gap-1">
                           <span className="text-xs font-medium text-base-content/70">Categoria:</span>
                           <span className="badge badge-primary badge-sm">{post.category}</span>
                        </div>
                     )}
                     
                     {post.hashtags && parseHashtags(post.hashtags).length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                           <span className="text-xs font-medium text-base-content/70">Tags:</span>
                           {parseHashtags(post.hashtags).map((tag, index) => (
                              <span 
                                 key={index}
                                 className="badge badge-accent badge-xs"
                              >
                                 {formatHashtagForDisplay(tag)}
                              </span>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* OG Link Preview */}
               {post.url && (
                  <div className="mb-6">
                     <OGLinkPreview url={post.url} compact={false} />
                  </div>
               )}

               {/* Descrizione se presente */}
               {post.description && (
                  <div className="text-lg text-base-content/80 font-medium italic mb-6 p-4 bg-base-100 rounded-lg border-l-4 border-primary">
                     {post.description}
                  </div>
               )}
            </header>

            {/* Contenuto del post */}
            <div className="prose prose-lg max-w-none 
                          [&>*]:text-base-content 
                          [&_h1]:text-base-content [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
                          [&_h2]:text-base-content [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5
                          [&_h3]:text-base-content [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4
                          [&_h4]:text-base-content [&_h4]:font-medium [&_h4]:mb-2 [&_h4]:mt-3
                          [&_h5]:text-base-content [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:mt-2
                          [&_h6]:text-base-content [&_h6]:font-medium [&_h6]:mb-1 [&_h6]:mt-2
                          [&_p]:text-base-content [&_p]:leading-relaxed [&_p]:mb-4
                          [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline
                          [&_strong]:text-base-content [&_strong]:font-semibold
                          [&_em]:text-base-content [&_em]:italic
                          [&_li]:text-base-content [&_li]:mb-1
                          [&_ul]:mb-4 [&_ol]:mb-4
                          [&_blockquote]:text-base-content/80 [&_blockquote]:border-l-base-300 [&_blockquote]:bg-base-100 [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg [&_blockquote]:my-4
                          [&_code]:bg-base-200 [&_code]:text-base-content [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                          [&_pre]:bg-base-200 [&_pre]:text-base-content [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
                          [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-md [&_img]:my-6"
               dangerouslySetInnerHTML={createMarkup(post.content || tempContent)} 
            />
         </article>
      </div>
   )
}

export default ViewPost
