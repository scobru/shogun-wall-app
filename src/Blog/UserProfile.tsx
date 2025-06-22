import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useListenAll from '../api/useListenAll'
import { DungeonNode } from '../Nodes'
import { formatAuthorDisplay } from '../utils/usernameMap'
import { createMarkup } from '../utils'
import usePostClicked from './usePostClicked'

interface UserProfileProps {}

const UserProfile: React.FC<UserProfileProps> = () => {
   const { username } = useParams<{ username: string }>()
   const navigate = useNavigate()
   const [activeTab, setActiveTab] = useState<'posts' | 'nodes'>('posts')
   
   // Ottieni tutti i post e nodi
   const allPosts = useListenAll('post')
   const allNodes = useListenAll('node')
   const postClicked = usePostClicked()
   
   // Filtra i post per l'utente specifico
   const userPosts = useMemo(() => {
      if (!username || !allPosts.length) return []
      
      return allPosts.filter(post => {
         return post.user === username || 
                post.userPub === username ||
                formatAuthorDisplay(post.user) === username
      }).sort((a, b) => Number(b.timestamp || b.date || 0) - Number(a.timestamp || a.date || 0))
   }, [allPosts, username])

   // Filtra i nodi per l'utente specifico
   const userNodes = useMemo(() => {
      if (!username || !allNodes.length) return []
      
      return allNodes.filter(node => {
         return node.user === username || 
                node.userPub === username ||
                formatAuthorDisplay(node.user) === username
      }).sort((a, b) => Number(b.timestamp || b.date || 0) - Number(a.timestamp || a.date || 0))
   }, [allNodes, username])

   const handlePostClick = useCallback((key: string | undefined) => {
      if (!key) return
      postClicked(key, { metaKey: false, altKey: false })
   }, [postClicked])

   const handleNodeClick = useCallback((key: string | undefined) => {
      if (!key) return
      navigate(`/node/${key}`)
   }, [navigate])

   useEffect(() => {
      document.title = `Profilo di ${formatAuthorDisplay(username || 'Utente')} - HAL 9000`
   }, [username])

   if (!username) {
      return (
         <div className="user-profile-container max-w-6xl mx-auto p-6">
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

   const totalContent = userPosts.length + userNodes.length

   return (
      <div className="user-profile-container max-w-6xl mx-auto p-6">
         {/* Header */}
         <div className="flex justify-between items-center mb-6 pb-4 border-b border-base-300">
            <div className="flex-1 min-w-0">
               <h1 className="text-3xl font-bold text-base-content mb-2 break-words">
                  Profilo di {formatAuthorDisplay(username)}
               </h1>
               <div className="flex flex-wrap gap-4 text-sm text-base-content/70">
                  <span>{userPosts.length} post</span>
                  <span>•</span>
                  <span>{userNodes.length} nodi</span>
                  <span>•</span>
                  <span>{totalContent} contenuti totali</span>
               </div>
               {/* Show if this is a public key */}
               {username && username.length > 50 && username.includes('.') && (
                  <div className="mt-2 text-xs text-base-content/50 font-mono break-all">
                     ID: {username}
                  </div>
               )}
            </div>
            <div className="flex gap-3">
               <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/blog')}
               >
                  ← Blog
               </button>
               <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/all')}
               >
                  ← Tutti i Nodi
               </button>
            </div>
         </div>

         {/* Tabs Navigation */}
         <div className="tabs tabs-boxed mb-6 bg-base-200">
            <button 
               className={`tab ${activeTab === 'posts' ? 'tab-active' : ''}`}
               onClick={() => setActiveTab('posts')}
            >
               📝 Blog Posts ({userPosts.length})
            </button>
            <button 
               className={`tab ${activeTab === 'nodes' ? 'tab-active' : ''}`}
               onClick={() => setActiveTab('nodes')}
            >
               🔗 Nodi ({userNodes.length})
            </button>
         </div>

         {/* Content Area */}
         {allPosts.length === 0 && allNodes.length === 0 ? (
            <div className="text-center py-20">
               <div className="loading loading-spinner loading-lg mb-4"></div>
               <h3 className="text-xl font-semibold mb-2">Caricamento contenuti...</h3>
               <p className="text-base-content/70">Recupero i dati dal database...</p>
            </div>
         ) : (
            <div className="content-area">
               {/* Tab Content: Posts */}
               {activeTab === 'posts' && (
                  <div className="posts-section">
                     {userPosts.length === 0 ? (
                        <div className="text-center py-20">
                           <div className="text-6xl mb-4">📝</div>
                           <h3 className="text-xl font-semibold mb-2">Nessun post trovato</h3>
                           <p className="text-base-content/70 mb-4">
                              <strong>{formatAuthorDisplay(username)}</strong> non ha ancora pubblicato post nel blog.
                           </p>
                           <button 
                              className="btn btn-primary"
                              onClick={() => navigate('/post/new')}
                           >
                              Scrivi un post
                           </button>
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
                                    <h2 className="card-title text-xl font-bold text-base-content mb-3">
                                       {post.title || 'Post senza titolo'}
                                    </h2>
                                    
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/70 mb-4">
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

                                    {post.description && (
                                       <div className="text-base-content/80 mb-3 p-3 bg-base-200 rounded-lg border-l-4 border-primary">
                                          {post.description}
                                       </div>
                                    )}

                                    {post.content && (
                                       <div 
                                          className="prose max-w-none text-base-content/70"
                                          style={{ 
                                             lineHeight: '1.6',
                                             overflow: 'hidden',
                                             textOverflow: 'ellipsis',
                                             display: '-webkit-box',
                                             WebkitLineClamp: 3,
                                             WebkitBoxOrient: 'vertical',
                                             maxHeight: '4.8em'
                                          }}
                                          dangerouslySetInnerHTML={createMarkup(post.content.substring(0, 200) + '...')}
                                       />
                                    )}

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
                  </div>
               )}

               {/* Tab Content: Nodes */}
               {activeTab === 'nodes' && (
                  <div className="nodes-section">
                     {userNodes.length === 0 ? (
                        <div className="text-center py-20">
                           <div className="text-6xl mb-4">🔗</div>
                           <h3 className="text-xl font-semibold mb-2">Nessun nodo trovato</h3>
                           <p className="text-base-content/70 mb-4">
                              <strong>{formatAuthorDisplay(username)}</strong> non ha ancora creato nodi nella rete.
                           </p>
                           <button 
                              className="btn btn-primary"
                              onClick={() => navigate('/node/new')}
                           >
                              Crea un nodo
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {userNodes.map((node) => (
                              <article 
                                 key={node.key}
                                 className="card bg-base-100 shadow border border-base-300 cursor-pointer transition-all hover:shadow-lg"
                                 onClick={() => handleNodeClick(node.key)}
                              >
                                 <div className="card-body p-4">
                                    <div className="flex justify-between items-start mb-3">
                                       <div className="flex-1">
                                          {node.directionText && (
                                             <h3 className="font-semibold text-base-content mb-2">
                                                {node.directionText}
                                             </h3>
                                          )}
                                          
                                          <div className="flex items-center gap-3 text-sm text-base-content/70 mb-2">
                                             <time className="flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                   <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                                                </svg>
                                                {new Date(node.timestamp || node.date || 0).toLocaleDateString('it-IT', {
                                                   month: 'short',
                                                   day: 'numeric',
                                                   hour: '2-digit',
                                                   minute: '2-digit'
                                                })}
                                             </time>
                                             
                                             {node.start && node.end && (
                                                <>
                                                   <span className="text-base-content/50">•</span>
                                                   <span className="text-xs font-mono">
                                                      {node.start} → {node.end}
                                                   </span>
                                                </>
                                             )}
                                          </div>
                                       </div>

                                       <div className="flex items-center gap-2 text-xs">
                                          {(node.upVotes || 0) > 0 && (
                                             <span className="badge badge-success badge-xs">
                                                👍 {node.upVotes}
                                             </span>
                                          )}
                                          {(node.downVotes || 0) > 0 && (
                                             <span className="badge badge-error badge-xs">
                                                👎 {node.downVotes}
                                             </span>
                                          )}
                                       </div>
                                    </div>

                                    {node.message && (
                                       <div 
                                          className="text-base-content/80 text-sm"
                                          style={{ 
                                             overflow: 'hidden',
                                             textOverflow: 'ellipsis',
                                             display: '-webkit-box',
                                             WebkitLineClamp: 2,
                                             WebkitBoxOrient: 'vertical',
                                             maxHeight: '3em'
                                          }}
                                       >
                                          {node.message.length > 150 
                                             ? node.message.substring(0, 150) + '...'
                                             : node.message
                                          }
                                       </div>
                                    )}

                                    <div className="card-actions justify-end mt-3">
                                       <button 
                                          className="btn btn-outline btn-xs"
                                          onClick={(e) => {
                                             e.stopPropagation()
                                             handleNodeClick(node.key)
                                          }}
                                       >
                                          Visualizza →
                                       </button>
                                    </div>
                                 </div>
                              </article>
                           ))}
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}

         {/* Footer con statistiche */}
         {totalContent > 0 && (
            <div className="text-center mt-8 p-4 bg-base-200 rounded-lg">
               <p className="text-sm text-base-content/70">
                  📊 <strong>Statistiche:</strong> {formatAuthorDisplay(username)} ha creato {totalContent} contenuti 
                  ({userPosts.length} post e {userNodes.length} nodi)
               </p>
            </div>
         )}
      </div>
   )
}

export default UserProfile
