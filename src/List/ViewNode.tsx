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

type ViewNodeProps = {
   node: DungeonNode
   onNodeRemoved: (nodeKey: string | undefined) => void
}

const ViewNodeStyled = styled.div`
   border: 1px solid var(--gray-200);
   border-radius: 8px;
   margin-bottom: 16px;
   padding: 16px;
   background-color: var(--card-color);
   cursor: pointer;
   transition: all 0.2s ease;
   
   &:hover {
      border-color: var(--gray-300);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
   }
`

const Title = styled.h4`
   margin: 4px 0px;
   font-weight: 800;
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
      color: var(--success-500);
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

export const ViewNode: FC<ViewNodeProps> = ({ node, onNodeRemoved }) => {
   const [isShowAdvanced, showAdvanced] = useState<boolean>(false)
   const [views] = useViewCount(node.key)
   const keypressed = useKeyboard(['v', 'd'])
   const auth = useAuth()
   const navigate = useNavigate()

   // Verifica se l'URL esiste e non è vuoto
   const hasValidUrl = node?.url && typeof node.url === 'string' && node.url.trim().length > 0

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

   return (
      <ViewNodeStyled className="viewNodeStyled" onClick={onPostClicked}>
         <div
            className="mainWrapper"
            style={{
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'flex-start',
               width: '100%',
            }}
         >
            <Title onClick={onPostClicked}>
               {node.directionText}
            </Title>
            
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
                           backgroundColor: '#f0f0f0',
                           color: '#666',
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
                     color: '#666', 
                     marginBottom: '8px',
                     lineHeight: '1.4'
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
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
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
                  color: '#666',
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
               <Link to={'/node/' + node.key}>node-link</Link>
            </div>
            
            {/* Pulsante Modifica */}
            {canEditNode(node) && (
               <div style={{ paddingLeft: '7px', paddingTop: '4px' }}>
                  <button
                     onClick={handleEditNode}
                     style={{
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                     }}
                     onMouseOver={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.transform = 'translateY(-1px)';
                        target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
                     }}
                     onMouseOut={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.transform = 'translateY(0)';
                        target.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
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
