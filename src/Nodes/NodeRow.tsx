import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import gun, { namespace } from '../api/gun'
import { SimpleIcon, Styles } from '../Interface'
import { ITEM_BORDER, Username } from './ViewNode.styled'
import { GunId } from '.'
import { useState, useEffect } from 'react'
import OGLinkPreview from '../components/OGLinkPreview'

export const LinkWrapper = styled.div`
   margin-bottom: 16px;
   border-radius: 8px;
   border: 1px solid var(--gray-200);
   background-color: var(--card-color);
   transition: all 0.2s ease;
   
   &:hover {
      border-color: var(--gray-300);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
   }
`

export const NodeLink = styled(Link)`
   display: block;
   padding: 16px;
   color: var(--text-color);
   text-decoration: none;
   
   .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--gray-100);
   }
   
   .comment-meta {
      display: flex;
      align-items: center;
      gap: 12px;
   }
   
   .comment-date {
      font-size: 12px;
      color: var(--gray-500);
      font-style: italic;
   }
   
   .comment-body {
      line-height: 1.5;
      font-size: 15px;
      color: var(--text-color);
      margin-bottom: 12px;
      
      p {
         margin: 0 0 8px 0;
         
         &:last-child {
            margin-bottom: 0;
         }
      }
   }
   
   .og-link-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      padding: 2px 6px;
      background-color: var(--primary-50);
      color: var(--primary-600);
      border-radius: 10px;
      font-weight: 500;
   }
   
   .comment-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--gray-100);
   }
   
   .view-full-link {
      font-size: 12px;
      color: var(--primary-600);
      font-weight: 500;
      
      &:hover {
         text-decoration: underline;
      }
   }
   
   &:hover {
      background-color: var(--gray-25);
   }
`

const ActionButton = styled.button`
   background: none;
   border: none;
   color: var(--gray-500);
   font-size: 12px;
   cursor: pointer;
   padding: 4px 8px;
   border-radius: 4px;
   transition: all 0.2s ease;
   
   &:hover {
      background-color: var(--gray-100);
      color: var(--text-color);
   }
   
   &.delete-btn:hover {
      background-color: var(--error-50);
      color: var(--error-600);
   }
`

type NodeRowProps = {
   key: string
   directionKey: string /* points to  👇 */
   directions: any /*              { [string]: string } 
                     i don't know how to say this in TS */
   pruneRight: (id: GunId) => void
}

const NodeRow = ({ directionKey, directions, pruneRight }: NodeRowProps) => {
   const [commentNode, setCommentNode] = useState<any>(null)
   
   // Fetch the full node data to show user information
   useEffect(() => {
      gun.get(`${namespace}/node`)
         .get(directionKey)
         .once((data: any) => {
            if (data) {
               console.log('🔍 [NodeRow] Comment node data:', data);
               console.log('🔍 [NodeRow] URL in comment:', data?.url);
               setCommentNode(data)
            }
         })
   }, [directionKey])
   
   const formatDate = (date: number | string) => {
      if (!date) return ''
      const d = new Date(date)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Ora'
      if (diffInHours < 24) return `${diffInHours}h fa`
      if (diffInHours < 48) return 'Ieri'
      return d.toLocaleDateString('it-IT', { 
         month: 'short', 
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   const truncateMessage = (message: string, maxLength: number = 200) => {
      if (!message) return ''
      const cleanMessage = message.replace(/<[^>]*>/g, '').trim()
      if (cleanMessage.length <= maxLength) return cleanMessage
      return cleanMessage.substring(0, maxLength) + '...'
   }
   
   return (
      <LinkWrapper className="linkWrapper">
         <NodeLink
            to={`/node/${directionKey}`}
            key={directionKey}
            className="nodeLink"
         >
            {commentNode ? (
               <>
                  <div className="comment-header">
                     <div className="comment-meta">
                        <Username className={commentNode.userType === 'shogun' ? 'shogun-user' : ''}>
                           @{commentNode.user || 'anon'}
                           {commentNode.userType === 'shogun' && (
                              <span className="verified-badge">✓</span>
                           )}
                           {commentNode.userType === 'guest' && (
                              <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.7 }}>Guest</span>
                           )}
                        </Username>
                        
                        {commentNode.category && (
                           <span style={{
                              padding: '1px 6px',
                              backgroundColor: 'var(--primary-100)',
                              color: 'var(--primary-700)',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: '500'
                           }}>
                              {commentNode.category}
                           </span>
                        )}
                     </div>
                     
                     <div className="comment-date">
                        {formatDate(commentNode.date || commentNode.timestamp)}
                        {commentNode.url && (
                           <span className="og-link-indicator">
                              Link
                           </span>
                        )}
                     </div>
                  </div>
                  
                  {/* Titolo del commento se presente */}
                  {commentNode.directionText && (
                     <div style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        marginBottom: '8px',
                        color: 'var(--text-color)'
                     }}>
                        {commentNode.directionText}
                     </div>
                  )}
                  
                  {/* Contenuto del commento */}
                  <div className="comment-body">
                     {truncateMessage(directions[directionKey] || commentNode.message || '(messaggio vuoto)')}
                  </div>
                  
                  {/* OG Link Preview per commenti con URL */}
                  {commentNode.url && (
                     <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                        <OGLinkPreview url={commentNode.url} compact={true} />
                     </div>
                  )}
                  
                  {/* Hashtags del commento */}
                  {commentNode.hashtags && (
                     <div style={{ 
                        marginTop: '8px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                     }}>
                        {commentNode.hashtags.split(/\s+/).filter(tag => tag.trim()).slice(0, 3).map((tag, index) => (
                           <span 
                              key={index}
                              style={{
                                 padding: '1px 4px',
                                 backgroundColor: 'var(--gray-100)',
                                 color: 'var(--gray-600)',
                                 borderRadius: '6px',
                                 fontSize: '9px',
                                 fontWeight: '500'
                              }}
                           >
                              {tag.startsWith('#') ? tag : `#${tag}`}
                           </span>
                        ))}
                     </div>
                  )}
                  
                  <div className="comment-actions">
                     <span className="view-full-link">
                        Visualizza commento completo →
                     </span>
                     
                     <ActionButton 
                        className="delete-btn"
                        onClick={(e) => {
                           e.preventDefault()
                           e.stopPropagation()
                           if (window.confirm('Rimuovere questo commento?')) {
                              pruneRight(directionKey)
                           }
                        }}
                        title="Rimuovi commento"
                     >
                        Rimuovi
                     </ActionButton>
                  </div>
               </>
            ) : (
               <div style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                     Caricamento commento...
                  </div>
               </div>
            )}
         </NodeLink>
      </LinkWrapper>
   )
}

export default NodeRow
