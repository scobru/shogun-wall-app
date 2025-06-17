import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import useListen from '../api/useListen'
import useDelete from '../api/useDelete'
import { useAuth } from '../utils/AuthContext'
import { createMarkup } from '../utils'
import usePostClicked from './usePostClicked'
import { getRandomFromArray } from '../utils'
import { DungeonNode } from 'Nodes'

export const PostStyled = styled.div<{ borderColor?: string }>`
   max-width: 700px;
   overflow-wrap: break-word;
   border: dashed thin ${({ borderColor }) => borderColor || ''};
   margin: 10px 0px 10px 0px;
   padding: 10px;
`

const PostHeaderStyled = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 15px;
   padding-bottom: 10px;
   border-bottom: 1px solid #eee;
   
   .author-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
   }
   
   .author-name {
      font-weight: bold;
      color: #333;
   }
   
   .shogun-badge {
      background: #4CAF50;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: bold;
   }
   
   .guest-badge {
      background: #999;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: bold;
   }
   
   .post-date {
      font-size: 12px;
      color: #999;
   }
`

const PostActionsStyled = styled.div`
   display: flex;
   gap: 12px;
   margin-top: 20px;
   padding-top: 15px;
   border-top: 2px solid #f0f0f0;
   
   .action-btn {
      padding: 8px 16px;
      font-size: 13px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
      
      &:hover {
         background: #f8f9fa;
         transform: translateY(-1px);
      }
      
      &.edit-btn:hover {
         border-color: #007bff;
         color: #007bff;
      }
      
      &.delete-btn:hover {
         border-color: #dc3545;
         color: #dc3545;
      }
      
      &.back-btn:hover {
         border-color: #6c757d;
         color: #6c757d;
      }
   }
`

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
         <PostStyled
            key={post?.key}
            borderColor={borderColor}
            onClick={(event) => {
               postClicked(key, {
                  metaKey: event.metaKey,
                  altKey: event.altKey,
               })
            }}
         >
            {/* Header con informazioni autore */}
            <PostHeaderStyled>
               <div className="author-info">
                  <span className="author-name">
                     {post?.user || 'Autore sconosciuto'}
                  </span>
                  {post?.userType === 'shogun' && (
                     <span className="shogun-badge">SHOGUN</span>
                  )}
                  {post?.userType === 'guest' && (
                     <span className="guest-badge">GUEST</span>
                  )}
                  {!post?.userType && post?.user && (
                     <span className="guest-badge">LEGACY</span>
                  )}
               </div>
               <div className="post-date">
                  {formatDate(post?.timestamp || post?.date)}
               </div>
            </PostHeaderStyled>
            
            {/* Contenuto del post */}
            <div dangerouslySetInnerHTML={createMarkup(post?.content || tempContent)} />
         </PostStyled>
         
         {/* Azioni del post */}
         <PostActionsStyled>
            <button 
               className="action-btn back-btn"
               onClick={handleBackToBlog}
               title="Torna al blog"
            >
               ← Torna al Blog
            </button>
            
            {canEditPost(post) && (
               <>
                  <button 
                     className="action-btn edit-btn"
                     onClick={handleEditPost}
                     title="Modifica post"
                  >
                     ✏️ Modifica Post
                  </button>
                  <button 
                     className="action-btn delete-btn"
                     onClick={handleDeletePost}
                     title="Cancella post"
                  >
                     🗑️ Cancella Post
                  </button>
               </>
            )}
         </PostActionsStyled>
      </div>
   )
}

export default ViewPost
