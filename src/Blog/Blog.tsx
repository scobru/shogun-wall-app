import { DungeonNode } from 'Nodes'
import { useEffect, useState, useCallback, memo, useMemo } from 'react'
import useListenAll from '../api/useListenAll'
import useDelete from '../api/useDelete'
import { useAuth } from '../utils/AuthContext'
import usePostClicked from './usePostClicked'
import { useNavigate, useLocation } from 'react-router-dom'
import { GlobalSearch } from '../components/GlobalSearch'
import { createMarkup } from '../utils'

const ViewPostList = memo(() => {
   const location = useLocation()
   const [refreshKey, setRefreshKey] = useState(0)
   const [lastLocationKey, setLastLocationKey] = useState<string | null>(null)
   
   // Memoize il model per l'hook basato su refreshKey
   const modelKey = useMemo(() => {
      return `post_${refreshKey}`
   }, [refreshKey])
   
   // Usa un model dinamico che include il refreshKey per forzare la reinizializzazione
   const posts = useListenAll('post', refreshKey)
   const postClicked = usePostClicked()
   const [deletePost] = useDelete('post', true)
   const auth = useAuth()
   const navigate = useNavigate()
   const [showCreatePrompt, setShowCreatePrompt] = useState(false)
   const [isForceRefreshing, setIsForceRefreshing] = useState(false)

   const handleDeletePost = useCallback((key: string) => {
      if (window.confirm('Sei sicuro di voler eliminare questo post?')) {
         // Passa i parametri di autenticazione corretti
         deletePost(key, auth.userPub || undefined, auth.currentUsername || undefined)
      }
   }, [deletePost, auth.userPub, auth.currentUsername])

   const handlePostClick = useCallback((key: string | undefined) => {
      if (!key) return
      postClicked(key, { metaKey: false, altKey: false })
   }, [postClicked])

   const handleSearchResult = useCallback((result: any) => {
      if (result.type === 'post') {
         navigate(`/blog/${result.id}`)
      } else if (result.type === 'node') {
         navigate(`/node/${result.id}`)
      }
   }, [navigate])

   useEffect(() => {
      document.title = `Blog Posts (${posts.length})`
   }, [posts.length])

   // Forza refresh al mount del componente
   useEffect(() => {
      console.log('🔄 [Blog] ViewPostList component mounted, forcing initial refresh')
      setRefreshKey(prev => prev + 1)
   }, []) // Empty dependency array = runs only on mount

   // Forza refresh quando si naviga verso la pagina blog
   useEffect(() => {
      console.log('🔄 [Blog] Location change detected:', {
         pathname: location.pathname,
         locationKey: location.key,
         lastLocationKey,
         isExactBlogPath: location.pathname === '/blog',
         isDifferentKey: location.key !== lastLocationKey
      })
      
      // Rileva se stiamo navigando alla lista blog (exact path) 
      // E se è una nuova navigazione (chiave diversa)
      if (location.pathname === '/blog' && location.key !== lastLocationKey) {
         console.log('🔄 [Blog] Navigation detected to /blog LIST, forcing refresh...')
         setIsForceRefreshing(true)
         setRefreshKey(prev => prev + 1)
         
         // Reset del flag dopo un breve delay
         setTimeout(() => {
            setIsForceRefreshing(false)
         }, 1000)
      }
      
      // Aggiorna la chiave dell'ultima location
      setLastLocationKey(location.key)
   }, [location.pathname, location.key, lastLocationKey]) // Aggiungi location.key per rilevare cambi di navigation

   // Timeout per mostrare prompt di creazione se non ci sono post
   useEffect(() => {
      const timer = setTimeout(() => {
         if (posts.length === 0 && !isForceRefreshing) {
            setShowCreatePrompt(true)
         } else {
            setShowCreatePrompt(false)
         }
      }, 3000) // Aspetta 3 secondi prima di mostrare il prompt

      return () => clearTimeout(timer)
   }, [posts.length, isForceRefreshing])

   // Debug per il problema di caricamento
   useEffect(() => {
      console.log('🔍 [Blog] ViewPostList mount/update:', {
         postsCount: posts.length,
         pathname: location.pathname,
         refreshKey,
         showCreatePrompt,
         isForceRefreshing
      })
   }, [posts.length, location.pathname, refreshKey, showCreatePrompt, isForceRefreshing])

   return (
      <div style={{ 
         maxWidth: '800px', 
         margin: '0 auto', 
         padding: '0 1rem',
         width: '100%'
      }}>
         {/* Ricerca Globale */}
         <GlobalSearch 
            onResultClick={handleSearchResult}
            placeholder="Cerca nei post e nodi..."
         />

         {/* Header Blog */}
         <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1rem'
         }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
               Blog Posts ({posts.length})
               {isForceRefreshing && (
                  <span style={{ 
                     fontSize: '0.8rem', 
                     color: 'var(--text-secondary)', 
                     marginLeft: '0.5rem' 
                  }}>
                     🔄 Aggiornamento...
                  </span>
               )}
            </h1>
            <button 
               onClick={() => navigate('/post/new')}
               style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
               }}
            >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
               </svg>
               Nuovo Post
            </button>
         </div>

         {/* Lista Posts */}
         {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
               {!showCreatePrompt || isForceRefreshing ? (
                  <>
                     <div style={{ marginBottom: '1rem' }}>
                        <div className="loading loading-spinner loading-md" style={{ margin: '0 auto 1rem auto' }}></div>
                     </div>
                     <h3>
                        {isForceRefreshing ? 'Aggiornamento in corso...' : 'Caricamento post...'}
                     </h3>
                     <p>Connessione a Gun.js in corso...</p>
                  </>
               ) : (
                  <>
                     <h3>Nessun post ancora</h3>
                     <p>Sii il primo a scrivere un post!</p>
                     <button 
                        onClick={() => navigate('/post/new')}
                        style={{
                           padding: '0.75rem 1.5rem',
                           background: 'var(--primary)',
                           color: 'white',
                           border: 'none',
                           borderRadius: '4px',
                           cursor: 'pointer',
                           marginTop: '1rem',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '0.5rem',
                           margin: '1rem auto 0 auto'
                        }}
                     >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        Scrivi il primo post
                     </button>
                  </>
               )}
            </div>
         ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {posts.map((post) => (
                  <article 
                     key={`${post.key}_${refreshKey}`} // Aggiungi refreshKey per forzare re-render
                     style={{
                        padding: '1.5rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        background: 'var(--surface)',
                        transition: 'box-shadow 0.2s ease',
                        cursor: 'pointer'
                     }}
                     onClick={() => handlePostClick(post.key)}
                     onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                     }}
                     onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                     }}
                  >
                     <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ 
                           margin: 0, 
                           fontSize: '1.25rem', 
                           fontWeight: '600',
                           marginBottom: '0.5rem',
                           color: 'var(--text-primary)'
                        }}>
                           {post.title || 'Post senza titolo'}
                        </h2>
                        
                        <div style={{ 
                           display: 'flex', 
                           justifyContent: 'space-between', 
                           alignItems: 'center',
                           fontSize: '0.875rem',
                           color: 'var(--text-secondary)'
                        }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                              </svg>
                              <span 
                                 style={{ 
                                    cursor: 'pointer', 
                                    textDecoration: 'underline',
                                    color: 'var(--primary)' 
                                 }}
                                 onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/profile/${encodeURIComponent(post.user || 'anonymous')}`)
                                 }}
                                 title={`Vedi tutti i post di ${post.user || 'Anonimo'}`}
                              >
                                 {post.user || 'Anonimo'}
                              </span>
                           </div>
                           
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                              </svg>
                              <span>{new Date(post.timestamp || post.date || 0).toLocaleDateString()}</span>
                           </div>
                        </div>

                        {post.content && (
                           <div 
                              className="post-preview-content"
                              style={{ 
                                 margin: 0, 
                                 color: 'var(--text-secondary)',
                                 lineHeight: '1.6',
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 display: '-webkit-box',
                                 WebkitLineClamp: 3,
                                 WebkitBoxOrient: 'vertical',
                                 maxHeight: '4.8em' // 3 lines * 1.6 line-height
                              }}
                              dangerouslySetInnerHTML={createMarkup(post.content.substring(0, 200))}
                           />
                        )}
                     </div>
                  </article>
               ))}
            </div>
         )}
      </div>
   )
})

ViewPostList.displayName = 'ViewPostList'

export default ViewPostList
