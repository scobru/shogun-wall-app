import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useListenAll from '../api/useListenAll'
import { DungeonNode } from '../Nodes'
import { formatAuthorDisplay } from '../utils/usernameMap'
import { createMarkup } from '../utils'
import usePostClicked from './usePostClicked'

const UserPosts: React.FC = () => {
   const { username } = useParams<{ username: string }>()
   const navigate = useNavigate()
   const allPosts = useListenAll('post')
   const postClicked = usePostClicked()
   
   // Filtra i post per l'utente specifico
   const userPosts = useMemo(() => {
      if (!username || !allPosts.length) return []
      
      return allPosts.filter(post => {
         // Controlla sia il campo 'user' che 'userPub' per coprire tutti i casi
         return post.user === username || 
                post.userPub === username ||
                formatAuthorDisplay(post.user) === username
      }).sort((a, b) => Number(b.timestamp || b.date || 0) - Number(a.timestamp || a.date || 0))
   }, [allPosts, username])

   const handlePostClick = useCallback((key: string | undefined) => {
      if (!key) return
      postClicked(key, { metaKey: false, altKey: false })
   }, [postClicked])

   useEffect(() => {
      document.title = `Post di ${username || 'Utente'} - HAL 9000`
   }, [username])

   if (!username) {
      return (
         <div className="user-posts-container max-w-4xl mx-auto p-6">
            <div className="text-center">
               <h2 className="text-2xl font-bold mb-4">Errore</h2>
               <p>Username non specificato.</p>
               <button 
                  className="btn btn-primary mt-4"
                  onClick={() => navigate('/blog')}
               >
                  ← Torna al Blog
               </button>
            </div>
         </div>
      )
   }

   return (
      <div className="user-posts-container max-w-4xl mx-auto p-6">
         {/* Header */}
         <div className="flex justify-between items-center mb-6 pb-4 border-b border-base-300">
            <div>
               <h1 className="text-3xl font-bold text-base-content mb-2">
                  Post di {formatAuthorDisplay(username)}
               </h1>
               <p className="text-base-content/70">
                  {userPosts.length === 0 
                     ? 'Nessun post trovato' 
                     : `${userPosts.length} post trovato/i`
                  }
               </p>
            </div>
            <button 
               className="btn btn-outline"
               onClick={() => navigate('/blog')}
            >
               ← Torna al Blog
            </button>
         </div>

         {/* Stato di caricamento */}
         {allPosts.length === 0 ? (
            <div className="text-center py-20">
               <div className="loading loading-spinner loading-lg mb-4"></div>
               <h3 className="text-xl font-semibold mb-2">Caricamento post...</h3>
               <p className="text-base-content/70">Recupero i dati dal database...</p>
            </div>
         ) : userPosts.length === 0 ? (
            <div className="text-center py-20">
               <div className="text-6xl mb-4">📝</div>
               <h3 className="text-xl font-semibold mb-2">Nessun post trovato</h3>
               <p className="text-base-content/70 mb-4">
                  L'utente <strong>{formatAuthorDisplay(username)}</strong> non ha ancora pubblicato post.
               </p>
               <div className="flex gap-3 justify-center">
                  <button 
                     className="btn btn-primary"
                     onClick={() => navigate('/post/new')}
                  >
                     Scrivi un post
                  </button>
                  <button 
                     className="btn btn-outline"
                     onClick={() => navigate('/blog')}
                  >
                     Vedi tutti i post
                  </button>
               </div>
            </div>
         ) : (
            <div className="space-y-6">
               {userPosts.map((post) => (
                  <article 
                     key={post.key}
                     className="card bg-base-100 shadow-lg border border-base-300 cursor-pointer transition-all hover:shadow-xl"
                     onClick={() => handlePostClick(post.key)}
                  >
                     <div className="card-body">
                        {/* Titolo del post */}
                        <h2 className="card-title text-xl font-bold text-base-content mb-3">
                           {post.title || 'Post senza titolo'}
                        </h2>
                        
                        {/* Metadati */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/70 mb-4">
                           <div className="flex items-center gap-2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                              </svg>
                              <span className="font-semibold">
                                 {formatAuthorDisplay(post.user)}
                              </span>
                              {post.userType === 'shogun' && (
                                 <span className="badge badge-success badge-xs">SHOGUN</span>
                              )}
                              {post.userType === 'guest' && (
                                 <span className="badge badge-neutral badge-xs">GUEST</span>
                              )}
                           </div>
                           <span className="text-base-content/50">•</span>
                           <time className="flex items-center gap-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                              </svg>
                              {new Date(post.timestamp || post.date || 0).toLocaleDateString('it-IT', {
                                 year: 'numeric',
                                 month: 'short',
                                 day: 'numeric',
                                 hour: '2-digit',
                                 minute: '2-digit'
                              })}
                           </time>
                           
                           {post.category && (
                              <>
                                 <span className="text-base-content/50">•</span>
                                 <span className="badge badge-primary badge-sm">{post.category}</span>
                              </>
                           )}
                        </div>

                        {/* Descrizione se presente */}
                        {post.description && (
                           <div className="text-base-content/80 mb-3 p-3 bg-base-200 rounded-lg border-l-4 border-primary">
                              {post.description}
                           </div>
                        )}

                        {/* Preview del contenuto */}
                        {post.content && (
                           <div 
                              className="prose max-w-none text-base-content/70"
                              style={{ 
                                 lineHeight: '1.6',
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 display: '-webkit-box',
                                 WebkitLineClamp: 4,
                                 WebkitBoxOrient: 'vertical',
                                 maxHeight: '6.4em'
                              }}
                              dangerouslySetInnerHTML={createMarkup(post.content.substring(0, 300) + '...')}
                           />
                        )}

                        {/* Actions */}
                        <div className="card-actions justify-end mt-4">
                           <button 
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                 e.stopPropagation()
                                 handlePostClick(post.key)
                              }}
                           >
                              Leggi tutto →
                           </button>
                        </div>
                     </div>
                  </article>
               ))}
            </div>
         )}

         {/* Footer con suggerimenti */}
         {userPosts.length > 0 && (
            <div className="text-center mt-8 p-4 bg-base-200 rounded-lg">
               <p className="text-sm text-base-content/70">
                  💡 <strong>Suggerimento:</strong> Clicca su un post per leggerlo completamente
               </p>
            </div>
         )}
      </div>
   )
}

export default UserPosts 