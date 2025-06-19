import { DungeonNode } from 'Nodes'
import { useEffect, useMemo, useState } from 'react'
import useListenAll from '../api/useListenAll'
import useDelete from '../api/useDelete'
import { useAuth } from '../utils/AuthContext'
import { createMarkup } from '../utils'
import usePostClicked from './usePostClicked'
import { useNavigate, useLocation } from 'react-router-dom'
import { formatPublicKey } from '../utils/usernameMap'
import { parseHashtags, formatHashtagForDisplay } from '../utils/hashtagUtils'
import { GlobalSearch } from '../components/GlobalSearch'
import { LoadingState } from '../components/LoadingStates'

const ViewPostList = () => {
   const posts = useListenAll('post')
   const postClicked = usePostClicked()
   const [deletePost] = useDelete('post', true)
   const auth = useAuth()
   const navigate = useNavigate()
   const location = useLocation()
   const [loadingStartTime] = useState(Date.now())
   const [componentMountTime] = useState(Date.now())

   useEffect(() => {
      document.title = `Blog`
      console.log(`📝 ViewPostList montato su percorso: ${location.pathname}`)
   }, [location.pathname])

   // Debug logging per monitorare i post
   useEffect(() => {
      const loadTime = Date.now() - loadingStartTime
      console.log(`📊 Blog posts aggiornati:`, {
         count: posts?.length || 0,
         loadTime: `${loadTime}ms`,
         pathway: location.pathname,
         posts: posts?.slice(0, 3)?.map(p => ({ key: p.key, title: p.title })) || []
      })
   }, [posts, loadingStartTime, location.pathname])

   // Handle search results
   const handleSearchResult = (result: any) => {
      if (result.type === 'post') {
         postClicked(result.id, { metaKey: false, altKey: false })
      } else if (result.type === 'node') {
         navigate(`/node/${result.id}`)
      }
   }

   // Ordina i post per data (più recenti prima)
   const sortedPosts = useMemo(() => {
      if (!posts || posts.length === 0) return []
      return [...posts].sort((a, b) => {
         const dateA = a.timestamp || a.date || 0
         const dateB = b.timestamp || b.date || 0
         return Number(dateB) - Number(dateA)
      })
   }, [posts])

   // Show loading only if posts is null and we haven't been waiting too long
   const showLoading = !posts && (Date.now() - componentMountTime) < 3000
   
   if (showLoading) {
      console.log(`⏳ Mostrando loading state per blog posts`)
      return <LoadingState type="posts" count={5} />
   }
   
   if (!posts || posts.length === 0) return (
      <div className="blog-container">
         <div className="debug-info">
            🐛 Debug: Post array = {posts ? `vuoto (${posts.length})` : 'null'} | 
            Tempo attesa: {Math.round((Date.now() - componentMountTime) / 1000)}s |
            Percorso: {location.pathname}
         </div>
         <div className="text-center py-20">
            <GlobalSearch onResultClick={handleSearchResult} />
            <h3 className="text-xl font-semibold mb-4">Nessun post trovato</h3>
            <p className="mb-4">Crea il primo post andando su <a href="/post/new" className="link link-primary">New Post</a>!</p>
            <p className="text-muted text-sm">
               Se hai già creato dei post, prova a ricaricare la pagina o controlla la connessione Gun.js
            </p>
         </div>
      </div>
   )

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

   // Funzione per cancellare un post
   const handleDeletePost = (postKey: string, postTitle: string) => {
      const confirmText = `Sei sicuro di voler cancellare il post "${postTitle}"?\n\nQuesta azione non può essere annullata.`
      if (window.confirm(confirmText)) {
         console.log(`🗑️ Cancellazione post: ${postKey}`)
         deletePost(postKey, auth.userPub || undefined, auth.currentUsername || undefined)
      }
   }

   // Funzione per modificare un post
   const handleEditPost = (postKey: string) => {
      if (postKey) {
      navigate(`/post/edit/${postKey}`)
      }
   }

   // Verifica se l'utente può modificare/cancellare un post
   const canEditPost = (post: DungeonNode) => {
      // Se l'utente è autenticato con Shogun, può modificare solo i suoi post
      if (auth.isAuthenticated) {
         return post.userPub === auth.userPub || post.user === auth.username
      }
      // Se è guest, può modificare solo i post con lo stesso username locale
      return post.user === auth.currentUsername
   }

   return (
      <div className="blog-container">
         {/* Debug info in development */}
         {process.env.NODE_ENV === 'development' && (
            <div className="debug-info">
               🐛 Debug: {sortedPosts.length} posts caricati | 
               Tempo: {Math.round((Date.now() - componentMountTime) / 1000)}s |
               Percorso: {location.pathname} |
               Gun connesso: {posts ? '✅' : '❌'}
            </div>
         )}
         
         {/* Global Search */}
         <GlobalSearch onResultClick={handleSearchResult} />
         
         {/* Info Header */}
         <div className="card bg-base-200 border border-base-300 p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-base-content">
               <span className="font-semibold">📝 Blog Posts ({sortedPosts.length})</span>
               <div className="divider divider-horizontal"></div>
               <span className="text-muted">💡 Suggerimento: Cmd/Ctrl + Click per cancellare, Alt + Click per modificare</span>
            </div>
         </div>
         
         {/* Posts Grid */}
         <div className="space-y-5">
         {sortedPosts.map((post) => (
               <div key={post.key} className="post-card">
                  <div className="card-body p-4">
                     {/* Post Header */}
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                           <h2 className="card-title text-lg mb-2">{post.title || 'Post senza titolo'}</h2>
                           <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm">👤 {formatAuthorDisplay(post)}</span>
                              {auth.isAuthenticated && post.userPub && (
                           <span className="shogun-badge">SHOGUN</span>
                        )}
                              {!auth.isAuthenticated && (
                           <span className="guest-badge">GUEST</span>
                        )}
                              <span className="text-xs text-muted">📅 {formatDate(post.timestamp || post.date)}</span>
                           </div>
                     </div>
                     </div>
                     
                     {/* Hashtags */}
                     {post.hashtags && (
                        <div className="flex flex-wrap gap-1 mb-3">
                           {parseHashtags(post.hashtags).map((hashtag, index) => (
                              <span 
                                 key={index}
                                 className="badge badge-accent badge-sm"
                              >
                                 {formatHashtagForDisplay(hashtag)}
                              </span>
                           ))}
                  </div>
                     )}
                  
                     {/* Post Content */}
                  <div 
                        className="prose prose-sm max-w-none cursor-pointer hover:text-primary transition-colors"
                        onClick={(event) => {
                           if (post.key) {
                        postClicked(post.key, {
                           metaKey: event.metaKey,
                           altKey: event.altKey,
                        })
                     }
                        }}
                        dangerouslySetInnerHTML={createMarkup(post.content as string)}
                     />
                     
                     {/* Actions */}
                     {canEditPost(post) && post.key && (
                        <div className="card-actions justify-end mt-4 pt-3 border-t border-base-300">
                        <button 
                           className="action-btn edit-btn"
                              onClick={(e) => {
                                 e.stopPropagation()
                                 if (post.key) {
                                    handleEditPost(post.key)
                                 }
                              }}
                        >
                           ✏️ Modifica
                        </button>
                        <button 
                           className="action-btn delete-btn"
                              onClick={(e) => {
                                 e.stopPropagation()
                                 if (post.key) {
                                    handleDeletePost(post.key, post.title || 'Post senza titolo')
                                 }
                              }}
                        >
                           🗑️ Cancella
                        </button>
                     </div>
                  )}
                  </div>
               </div>
         ))}
         </div>
      </div>
   )
}

export default ViewPostList
