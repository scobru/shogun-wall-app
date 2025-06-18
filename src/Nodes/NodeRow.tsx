import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import gun, { namespace } from '../api/gun'
import { SimpleIcon, Styles } from '../Interface'
import { ITEM_BORDER, Username } from './ViewNode.styled'
import { GunId } from '.'
import { useState, useEffect } from 'react'

export const LinkWrapper = styled.div`
   padding: 0.5rem 2rem;
   display: flex;
   flex-direction: row;
   align-items: stretch;
`

export const NodeLink = styled(Link)`
   padding: 1rem 1rem;
   margin: 0 1rem 0 0;
   border: ${ITEM_BORDER};
   border-radius: 8px;
   flex-grow: 2;
   color: black;
   text-decoration: none;
   
   .comment-header {
      display: flex;
      margin-bottom: 8px;
      align-items: center;
   }
   
   .comment-body {
      line-height: 1.4;
   }
   
   .og-link-indicator {
      display: inline-block;
      margin-left: 10px;
      font-size: 12px;
      padding: 1px 6px;
      background-color: #e8f0fe;
      color: #1a73e8;
      border-radius: 10px;
      font-weight: bold;
   }
   
   &:hover {
      background-color: var(--widget-hover-color);
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
                     <Username className={commentNode.userType === 'shogun' ? 'shogun-user' : ''}>
                        @{commentNode.user || 'anon'}
                        {commentNode.userType === 'shogun' && (
                           <span className="verified-badge">✓</span>
                        )}
                     </Username>
                     {commentNode.date && (
                        <span style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                           {new Date(commentNode.date).toLocaleDateString()}
                        </span>
                     )}
                     {commentNode.url && (
                        <span className="og-link-indicator">🔗 og-link</span>
                     )}
                  </div>
                  <div className="comment-body">
                     {directions[directionKey] || `(missing message)`}
                  </div>
               </>
            ) : (
               <>{directions[directionKey] || `(missing key)`}</>
            )}
         </NodeLink>

         <SimpleIcon
            content="[ d ]"
            hoverContent={'[ prune ]'}
            style={Styles.warning}
            className="simpleIcon"
            onClick={() => {
               pruneRight(directionKey)
            }}
         />
      </LinkWrapper>
   )
}

export default NodeRow
