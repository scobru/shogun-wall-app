import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { SimpleIcon, Styles } from '../Interface'
import { DungeonNode } from '../Nodes'
import gun, { namespace } from '../api/gun'
import { useNavigate } from 'react-router-dom'
import useKeyboard from '../utils/useKeyboard'
import { TimeAgo } from './TimeAgo'
import useViewCount from './useViewCount'
import ViewCount from './ViewCount'
import { formatAuthorDisplay } from '../utils/usernameMap'
import OGLinkPreview from '../components/OGLinkPreview'
import { useAuth } from '../utils/AuthContext'
import { createMarkup } from '../utils'
import useUpdate from '../api/useUpdate'

type ViewNodeProps = {
   node: DungeonNode
   onNodeRemoved: (nodeKey: string | undefined) => void
}

const ViewNodeStyled = styled.div`
   border: 1px solid var(--gray-200);
   border-radius: 1rem;
   margin-bottom: 16px;
   padding: 16px;
   background: var(--card-color);
   backdrop-filter: blur(20px);
   cursor: pointer;
   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
               0 2px 4px -1px rgba(0, 0, 0, 0.03);
   
   &:hover {
      transform: translateY(-4px);
      border-color: var(--primary-200);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1),
                  0 0 30px rgba(59, 130, 246, 0.1);
      background: var(--gray-50);
   }

   .mainWrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
   }

   .comment-body {
      color: var(--gray-700);
   }

   .nodeLink {
      color: var(--primary-600);
      text-decoration: none;
      
      &:hover {
         text-decoration: underline;
      }
   }

   [class*="link-indicator"] {
      color: var(--gray-600);
   }
`

const Title = styled.h4`
   margin: 4px 0px;
   font-weight: 800;
   color: var(--gray-900) !important;
`

const Username = styled.div`
   font-size: 12px;
   color: var(--gray-600);
   font-weight: 500;
   
   &.shogun-user {
      color: var(--primary-600);
      font-weight: 600;
   }
   
   .verified-badge {
      color: var(--success-600);
      margin-left: 4px;
      font-size: 10px;
   }
`

const Menu = styled.div`
   flex: 1;
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   
   .simpleIcon {
      color: red;
      margin-left: 5px;
   }
   .timeAgo {
      padding-left: 7px;
      padding-top: 5px;
      font-style: italic;
   }
   .viewCount {
      padding-left: 7px;
      padding-top: 5px;
   }
   .ogLink {
      padding-left: 7px;
      padding-top: 4px;
      
      a {
         display: inline-flex;
         align-items: center;
         text-decoration: none;
         color: #1a73e8;
         font-weight: 500;
         
         &:before {
            content: "🔗";
            margin-right: 3px;
         }
         
         &:hover {
            text-decoration: underline;
         }
      }
   }
   .nodeLink {
      padding-left: 7px;
      padding-top: 4px;
      
      a {
         text-decoration: none;
         color: #333;
         font-weight: 500;
         
         &:hover {
            text-decoration: underline;
         }
      }
   }
`

const VoteText = styled.span`
   display: inline-flex;
   align-items: center;
   gap: 4px;
   cursor: pointer;
   font-size: 13px;
   font-weight: 500;
   color: #94a3b8;
   transition: all 0.2s ease;
   user-select: none;

   &.upvote {
      &:hover {
         color: #4CAF50;
      }
      
      &.voted {
         color: #4CAF50;
         font-weight: 600;
      }
   }

   &.downvote {
      &:hover {
         color: #f44336;
      }
      
      &.voted {
         color: #f44336;
         font-weight: 600;
      }
   }

   .vote-icon {
      font-size: 11px;
   }

   .vote-count {
      min-width: 16px;
      text-align: center;
   }
`

const VoteContainer = styled.div`
   display: flex;
   align-items: center;
   gap: 12px;
   padding: 4px 8px;
   border-radius: 6px;
   background: rgba(255, 255, 255, 0.05);
   margin-left: 7px;
   margin-top: 5px;
`

export const ViewNode: FC<ViewNodeProps> = ({ node, onNodeRemoved }) => {
   const [isShowAdvanced, showAdvanced] = useState<boolean>(false)
   const [views] = useViewCount(node.key)
   const keypressed = useKeyboard(['v', 'd'])
   const auth = useAuth()
   const navigate = useNavigate()
   const [createNode] = useUpdate('node')
   
   // Verifica se l'URL esiste e non è vuoto
   const hasValidUrl = node.url && 
      node.url.trim() !== '' && 
      node.url !== 'undefined' && 
      node.url !== 'null'

   // Funzione per creare un'anteprima del messaggio
   const createMessagePreview = (message: string, maxLength: number = 150) => {
      if (!message) return ''
      
      // Prima sanitizza l'HTML con createMarkup
      const sanitized = createMarkup(message).__html
      
      // Poi crea un elemento temporaneo per estrarre solo il testo
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = sanitized
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      
      // Tronca il testo se necessario
      if (textContent.length <= maxLength) {
         return sanitized
      }
      
      // Se dobbiamo troncare, prendiamo solo il testo e aggiungiamo ...
      return textContent.substring(0, maxLength) + '...'
   }

   // Log semplificato per monitorare i post Reddit
   useEffect(() => {
      if (node?.platform === 'reddit' && node?.url) {
         console.log('🔍 [ViewNode] Post Reddit:', {
            title: node.directionText,
            url: node.url,
            hasValidUrl
         })
      }
   }, [node?.platform, node?.url, node?.directionText, hasValidUrl])

   // Verifica se l'utente può cancellare il nodo
   const canDeleteNode = () => {
      if (!auth.hasAnyAuth) {
         return false
      }
      
      // Se l'utente è autenticato con Shogun, può cancellare solo i suoi nodi
      if (auth.isAuthenticated) {
         return node.userPub === auth.userPub || node.user === auth.username
      }
      
      // Se è guest, può cancellare solo i nodi con lo stesso username locale
      return node.user === auth.currentUsername
   }

   // Verifica se l'utente può modificare il nodo
   const canEditNode = (node: DungeonNode) => {
      if (!node) return false
      // Se l'utente è autenticato con Shogun, può modificare solo i suoi nodi
      if (auth.isAuthenticated) {
         return node.userPub === auth.userPub || node.user === auth.username
      }
      // Se è guest, può modificare solo i nodi con lo stesso username locale
      return node.user === auth.currentUsername
   }

   const derefNode = () => {
      if (!node.key) {
         console.warn('Cannot delete node: node.key is undefined')
         return
      }
      
      gun.get(namespace + '/node')
         .get(node.key)
         .put(null as any, (awk: any) => {
            console.log(awk)
            onNodeRemoved(node.key)
         })
   }

   const handleEditNode = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (canEditNode(node)) {
         navigate(`/dashboard/${node.key}`)
      }
   }

   useEffect(() => {
      if (keypressed === 'v') {
         showAdvanced(!isShowAdvanced)
      }
      if (keypressed === 'd') {
         derefNode()
      }
   }, [keypressed, isShowAdvanced])

   const onPostClicked = () => {
      console.log('🔍 [ViewNode] Post clicked:', {
         key: node.key,
         url: node?.url,
         platform: node?.platform
      })

      // Per i post Reddit, naviga sempre al nodo interno per mostrare il contenuto estratto
      if (node?.platform === 'reddit') {
         console.log('🔍 [ViewNode] Navigating to Reddit node:', `/node/${node.key}`)
         navigate(`/node/${node.key}`)
         return
      }

      // Per altri tipi di contenuto, comportamento normale
      if (node?.url && hasValidUrl) {
         window.open(node.url, '_blank')
      } else {
         navigate(`/node/${node.key}`)
      }
   }

   // Voting functions
   const upVote = (node: DungeonNode) => {
      if (!node.key) return
      const upVotes = (node?.upVotes || 0) + 1
      createNode({ key: node.key, upVotes })
   }

   const downVote = (node: DungeonNode) => {
      if (!node.key) return
      const downVotes = (node?.downVotes || 0) + 1
      createNode({ key: node.key, downVotes })
   }

   return (
      <ViewNodeStyled className="viewNodeStyled" onClick={onPostClicked}>
         <div className="mainWrapper">
            <Title>{node.directionText}</Title>
            
            {/* Hashtags */}
            {node.hashtags && (
               <div style={{ 
                  marginBottom: '8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px'
               }}>
                  {node.hashtags.split(/\s+/).filter(tag => tag.trim()).slice(0, 5).map((tag, index) => (
                     <span 
                        key={index}
                        style={{
                           padding: '1px 6px',
                           background: 'var(--primary-50)',
                           border: '1px solid var(--primary-100)',
                           color: 'var(--primary-700)',
                           borderRadius: '8px',
                           fontSize: '10px',
                           fontWeight: '500'
                        }}
                     >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                     </span>
                  ))}
               </div>
            )}

            {/* Message preview */}
            {node.message && (
               <div 
                  style={{ 
                     fontSize: '14px', 
                     color: 'var(--gray-700)', 
                     marginBottom: '8px',
                     lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{
                     __html: createMessagePreview(node.message, 150)
                  }}
               />
            )}
         </div>

         <Menu>
            {node.user && (
               <Username 
                  className={node.userType === 'shogun' ? 'shogun-user' : ''}
                  onClick={(e) => {
                     e.stopPropagation()
                     navigate(`/profile/${encodeURIComponent(node.user)}`)
                  }}
                  style={{ 
                     cursor: 'pointer', 
                     textDecoration: 'underline',
                     color: 'var(--gray-700)'
                  }}
                  title={`Vedi tutti i contenuti di ${formatAuthorDisplay(node.user)}`}
               >
                  @{formatAuthorDisplay(node.user)}
                  {node.userType === 'shogun' && (
                     <span className="verified-badge">✓</span>
                  )}
               </Username>
            )}
            {node.date && <TimeAgo date={node.date}></TimeAgo>}
            <ViewCount count={views} />
            
            {node.platform && (
               <div style={{
                  fontSize: '11px',
                  color: 'var(--gray-600)',
                  fontStyle: 'italic',
                  paddingLeft: '7px',
                  paddingTop: '5px'
               }}>
                  via {node.platform}
                  {node.channel && ` (r/${node.channel})`}
                  {node.score && ` (${node.score} points)`}
                  {node.tags && ` [${node.tags}]`}
               </div>
            )}
            
            {hasValidUrl && node.url && (
               <OGLinkPreview url={node.url} compact={true} />
            )}

            <div className="nodeLink">
               <Link to={'/node/' + node.key} style={{ color: 'var(--primary-600)' }}>node-link</Link>
            </div>
            
            {/* Sistema di voting */}
            <VoteContainer onClick={e => e.stopPropagation()}>
               <VoteText 
                  className="upvote"
                  onClick={(e) => {
                     e.stopPropagation()
                     upVote(node)
                  }}
                  title="Upvote questo contenuto"
                  style={{ color: 'var(--gray-600)' }}
               >
                  <span className="vote-icon">▲</span>
                  <span className="vote-count">{node?.upVotes || 0}</span>
               </VoteText>

               <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  color: (node?.upVotes || 0) > (node?.downVotes || 0) ? 'var(--success-600)' : 
                         (node?.downVotes || 0) > (node?.upVotes || 0) ? 'var(--error-600)' : 'var(--gray-500)'
               }}>
                  {(node?.upVotes || 0) - (node?.downVotes || 0)}
               </span>

               <VoteText 
                  className="downvote"
                  onClick={(e) => {
                     e.stopPropagation()
                     downVote(node)
                  }}
                  title="Downvote questo contenuto"
                  style={{ color: 'var(--gray-600)' }}
               >
                  <span className="vote-icon">▼</span>
                  <span className="vote-count">{node?.downVotes || 0}</span>
               </VoteText>
            </VoteContainer>
            
            {/* Pulsante Modifica */}
            {canEditNode(node) && (
               <div style={{ paddingLeft: '7px', paddingTop: '4px' }}>
                  <button
                     onClick={handleEditNode}
                     style={{
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.15)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                     }}
                     onMouseOver={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.transform = 'translateY(-2px)';
                        target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                        target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
                     }}
                     onMouseOut={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.transform = 'translateY(0)';
                        target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                        target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.15)';
                     }}
                     title="Modifica questo contenuto"
                  >
                     <span style={{ fontSize: '10px' }}>✏️</span>
                     <span>Edit</span>
                  </button>
               </div>
            )}
            
            {isShowAdvanced && canDeleteNode() && (
               <SimpleIcon
                  content="[ ␡ ]"
                  hoverContent={'[ ␡ ]'}
                  style={Styles.warning}
                  className="simpleIcon"
                  onClick={() => derefNode()}
               />
            )}
         </Menu>
      </ViewNodeStyled>
   )
}
