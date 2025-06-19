import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useListen from '../api/useListen'
import useDelete from '../api/useDelete'
import { useAuth } from '../utils/AuthContext'
import { createMarkup } from '../utils'
import usePostClicked from './usePostClicked'
import { getRandomFromArray } from '../utils'
import { DungeonNode } from 'Nodes'
import { formatPublicKey } from '../utils/usernameMap'
import { parseHashtags, formatHashtagForDisplay } from '../utils/hashtagUtils'

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

   // Helper per formattare l'username/author per display
   const formatAuthorDisplay = (post: DungeonNode) => {
      const user = post.user || 'Autore sconosciuto'
      
      // Se sembra una pubkey (lunga e alfanumerica), formattala
      if (typeof user === 'string' && user.length > 20 && /^[A-Za-z0-9._-]+$/.test(user)) {
         return formatPublicKey(user)
      }
      
      return user
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
   const handleDeletePost = () => {
      if (!post) return
      const confirmText = `Sei sicuro di voler cancellare il post "${post.title || 'Post senza titolo'}"?\n\nQuesta azione non può essere annullata.`
      if (window.confirm(confirmText)) {
         console.log(`🗑️ Cancellazione post: ${key}`)
         deletePost(key)
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

   return (
      <div>
         <div
            key={post?.key}
            className="max-w-3xl break-words border border-dashed my-2.5 p-2.5 text-base-content cursor-pointer hover:bg-base-200 transition-colors"
            style={{ borderColor }}
            onClick={(event) => {
               postClicked(key, {
                  metaKey: event.metaKey,
                  altKey: event.altKey,
               })
            }}
         >
            {/* Header con informazioni autore */}
            <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-base-300">
               <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <span className="font-bold text-base-content">
                     {post ? formatAuthorDisplay(post) : 'Autore sconosciuto'}
                  </span>
                  {post?.userType === 'shogun' && (
                     <span className="badge badge-success badge-xs">SHOGUN</span>
                  )}
                  {post?.userType === 'guest' && (
                     <span className="badge badge-neutral badge-xs">GUEST</span>
                  )}
                  {!post?.userType && post?.user && (
                     <span className="badge badge-neutral badge-xs">LEGACY</span>
                  )}
               </div>
               <div className="text-xs text-base-content/50">
                  {formatDate(post?.timestamp || post?.date)}
               </div>
            </div>
            
            {/* Tags, categoria e OG Link */}
            {(post?.category || post?.hashtags || post?.url) && (
               <div className="mb-4 p-3 bg-base-100 rounded-lg border border-base-300 text-sm">
                  {/* Categoria */}
                  {post?.category && (
                     <div className="mb-2">
                        <span className="font-bold text-base-content mr-2">
                           📂 Categoria:
                        </span>
                        <span className="badge badge-error text-white text-xs font-bold">
                           {post.category}
                        </span>
                     </div>
                  )}
                  
                  {/* Hashtags */}
                  {post?.hashtags && parseHashtags(post.hashtags).length > 0 && (
                     <div className={post?.url ? 'mb-2' : ''}>
                        <span className="font-bold text-base-content mr-2">
                           🏷️ Tags:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                           {parseHashtags(post.hashtags).map((tag, index) => (
                              <span 
                                 key={index}
                                 className="badge badge-outline badge-xs"
                              >
                                 {formatHashtagForDisplay(tag)}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}
                  
                  {/* OG Link */}
            {post?.url && (
                     <div>
                        <span className="font-bold mr-2 text-base-content">
                           🔗 URL Esterno:
                        </span>
                  <a 
                     href={post.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                           className="link link-primary text-sm"
                  >
                     {post.url}
                  </a>
                     </div>
                  )}
               </div>
            )}
            
            {/* Contenuto del post */}
            <div 
               className="prose prose-sm max-w-none [&>*]:text-base-content [&_h1]:text-base-content [&_h2]:text-base-content [&_h3]:text-base-content [&_h4]:text-base-content [&_h5]:text-base-content [&_h6]:text-base-content [&_p]:text-base-content [&_a]:text-primary [&_strong]:text-base-content [&_em]:text-base-content [&_li]:text-base-content [&_blockquote]:text-base-content/70 [&_blockquote]:border-l-base-300 [&_code]:bg-base-200 [&_code]:text-base-content [&_pre]:bg-base-200 [&_pre]:text-base-content"
               dangerouslySetInnerHTML={createMarkup(post?.content || tempContent)} 
            />
         </div>
         
         {/* Azioni del post */}
         <div className="flex gap-3 mt-5 pt-4 border-t-2 border-base-200">
            <button 
               className="btn btn-outline btn-sm"
               onClick={handleBackToBlog}
               title="Torna al blog"
            >
               ← Torna al Blog
            </button>
            
            {canEditPost(post) && (
               <>
                  <button 
                     className="btn btn-primary btn-sm"
                     onClick={handleEditPost}
                     title="Modifica post"
                  >
                     ✏️ Modifica Post
                  </button>
                  <button 
                     className="btn btn-error btn-sm"
                     onClick={handleDeletePost}
                     title="Cancella post"
                  >
                     🗑️ Cancella Post
                  </button>
               </>
            )}
         </div>
      </div>
   )
}

export default ViewPost
