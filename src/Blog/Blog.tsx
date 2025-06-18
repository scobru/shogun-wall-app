import { DungeonNode } from 'Nodes'
import { useEffect } from 'react'
import useListenAll from '../api/useListenAll'
import useDelete from '../api/useDelete'
import { useAuth } from '../utils/AuthContext'
import { createMarkup } from '../utils'
import usePostClicked from './usePostClicked'
import { PostStyled } from './ViewPost'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const PostListItemStyled = styled.div`
   .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
   }
   
   .author-info {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
   }
   
   .author-name {
      font-weight: bold;
      color: #333;
   }
   
   .shogun-badge {
      background: #4CAF50;
      color: white;
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 8px;
      font-weight: bold;
   }
   
   .guest-badge {
      background: #999;
      color: white;
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 8px;
      font-weight: bold;
   }
   
   .post-date {
      font-size: 11px;
      color: #999;
   }
   
   .post-content {
      cursor: pointer;
   }
   
   .post-actions {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #f0f0f0;
   }
   
   .action-btn {
      padding: 4px 8px;
      font-size: 11px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
         background: #f8f9fa;
      }
      
      &.edit-btn:hover {
         border-color: #007bff;
         color: #007bff;
      }
      
      &.delete-btn:hover {
         border-color: #dc3545;
         color: #dc3545;
      }
   }
`

const GetPost = ({ id }) => {
   // Questo componente sembra non essere utilizzato, lo manteniamo per compatibilità
   const post = useListenAll('post').find(p => p.key === id) as DungeonNode
   const postClicked = usePostClicked()

   if (!post) return null

   return (
      <PostStyled
         key={post.key}
         onClick={(event) => {
            postClicked(post.key, {
               metaKey: event.metaKey,
               altKey: event.altKey,
            })
         }}
         dangerouslySetInnerHTML={createMarkup(post.content as string)}
      />
   )
}

const ViewPostList = () => {
   const posts = useListenAll('post')
   const postClicked = usePostClicked()
   const [deletePost] = useDelete('post', true)
   const auth = useAuth()
   const navigate = useNavigate()

   useEffect(() => {
      document.title = `Blog`
   }, [])

   console.log('🔍 ViewPostList Debug:', { posts, postsLength: posts?.length })

   if (!posts) return <div>Caricamento post...</div>
   
   if (posts.length === 0) return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
         <h3>Nessun post trovato</h3>
         <p>Crea il primo post andando su <a href="/post/new">New Post</a>!</p>
      </div>
   )

   // Formatta la data
   const formatDate = (timestamp: number) => {
      if (!timestamp) return 'Data sconosciuta'
      return new Date(timestamp).toLocaleDateString('it-IT', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   // Ordina i post per data (più recenti prima)
   const sortedPosts = [...posts].sort((a, b) => {
      const dateA = a.timestamp || a.date || 0
      const dateB = b.timestamp || b.date || 0
      return Number(dateB) - Number(dateA)
   })

   // Funzione per cancellare un post
   const handleDeletePost = (postKey: string, postTitle: string) => {
      const confirmText = `Sei sicuro di voler cancellare il post "${postTitle}"?\n\nQuesta azione non può essere annullata.`
      if (window.confirm(confirmText)) {
         console.log(`🗑️ Cancellazione post: ${postKey}`)
         // Passa le informazioni di autorizzazione per la verifica lato "server"
         deletePost(postKey, auth.userPub, auth.currentUsername)
      }
   }

   // Funzione per modificare un post
   const handleEditPost = (postKey: string) => {
      navigate(`/post/edit/${postKey}`)
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
      <div>
         <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <strong>📝 Blog Posts ({posts.length})</strong>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
               💡 <strong>Suggerimento:</strong> Cmd/Ctrl + Click per cancellare, Alt + Click per modificare
            </div>
         </div>
         
         {sortedPosts.map((post) => (
            <PostStyled key={post.key}>
               <PostListItemStyled>
                  <div className="post-header">
                     <div className="author-info">
                        <span className="author-name">
                           {post.user || 'Autore sconosciuto'}
                        </span>
                        {post.userType === 'shogun' && (
                           <span className="shogun-badge">SHOGUN</span>
                        )}
                        {post.userType === 'guest' && (
                           <span className="guest-badge">GUEST</span>
                        )}
                        {!post.userType && post.user && (
                           <span className="guest-badge">LEGACY</span>
                        )}
                     </div>
                     <div className="post-date">
                        {formatDate(post.timestamp || post.date)}
                     </div>
                  </div>
                  
                  <div 
                     className="post-content"
                     onClick={(event) =>
                        postClicked(post.key, {
                           metaKey: event.metaKey,
                           altKey: event.altKey,
                        })
                     }
                     dangerouslySetInnerHTML={createMarkup(post.content)}
                  />
                  
                  {/* Mostra indicatore og-link se presente */}
                  {post.url && (
                     <div style={{ 
                        marginTop: '10px', 
                        fontSize: '12px', 
                        display: 'flex', 
                        alignItems: 'center'
                     }}>
                        <span style={{ 
                           padding: '2px 6px', 
                           backgroundColor: '#e8f0fe', 
                           color: '#1a73e8', 
                           borderRadius: '10px', 
                           fontWeight: 'bold'
                        }}>
                           🔗 og-link
                        </span>
                     </div>
                  )}
                  
                  {/* Azioni del post - mostra solo se l'utente può modificarlo */}
                  {canEditPost(post) && (
                     <div className="post-actions">
                        <button 
                           className="action-btn edit-btn"
                           onClick={() => handleEditPost(post.key)}
                           title="Modifica post"
                        >
                           ✏️ Modifica
                        </button>
                        <button 
                           className="action-btn delete-btn"
                           onClick={() => handleDeletePost(post.key, post.title || 'Post senza titolo')}
                           title="Cancella post"
                        >
                           🗑️ Cancella
                        </button>
                     </div>
                  )}
               </PostListItemStyled>
            </PostStyled>
         ))}
      </div>
   )
}

export default ViewPostList
