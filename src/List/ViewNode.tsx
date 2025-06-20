import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { SimpleIcon, Styles } from '../Interface'
import { DungeonNode } from '../Nodes'
import gun, { namespace } from '../api/gun'
import { useNavigate } from 'react-router-dom'
import useListen from '../api/useListen'
import useKeyboard from '../utils/useKeyboard'
import { TimeAgo } from './TimeAgo'
import useViewCount from './useViewCount'
import ViewCount from './ViewCount'

type ViewNodeProps = {
   node: DungeonNode
   onNodeRemoved: (nodeKey: string | undefined) => void
}

const ViewNodeStyled = styled.div`
   margin-top: 15px;
   padding: 1em 1em 1em 1em;
   display: flex;
   flex-direction: column;
   border-radius: 10px;
   background-color: var(--card-color);
   border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
   transition: all 0.2s ease;
   
   &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      border-color: var(--primary-200, rgba(0, 120, 212, 0.3));
   }

   img {
      width: 100%;
   }
   
   /* Miglioramento contrasto per modalità light */
   @media (prefers-color-scheme: light) {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
      
      &:hover {
         box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
         border-color: #d1d5db;
      }
   }
`
const HeadLink = styled(Link)`
   font-style: italic;
   color: #333;
   margin-left: 0px;
   padding-bottom: 8px;
`
const Username = styled.div`
   padding: 4px 8px;
   background-color: var(--accent-color, #f3f4f6);
   border-radius: 12px;
   font-weight: 600;
   margin-right: 8px;
   font-size: 14px;
   display: flex;
   align-items: center;
   color: var(--text-color, #374151);
   border: 1px solid var(--border-color, #e5e7eb);
   
   &.shogun-user {
      background-color: #22c55e;
      color: white;
      border-color: #16a34a;
   }
   
   .verified-badge {
      margin-left: 4px;
      font-size: 11px;
      color: #22c55e;
   }
   
   /* Miglioramento contrasto per modalità light */
   @media (prefers-color-scheme: light) {
      background-color: #f9fafb;
      color: #374151;
      border: 1px solid #d1d5db;
      
      &.shogun-user {
         background-color: #22c55e;
         color: white;
         border-color: #16a34a;
      }
   }
`

const Message = styled.div`
   margin-top: 1em;
`

const Title = styled.h4`
   margin: 4px 0px;
   font-weight: 800;
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
   const navigate = useNavigate()
   const head = useListen(node.head, 'node', true) as DungeonNode
   const [isShowAdvanced, showAdvanced] = useState<boolean>(false)
   const [views] = useViewCount(node.key)
   const keypressed = useKeyboard(['v'])
   
   // Verifica se l'URL esiste e non è vuoto
   const hasValidUrl = node?.url && typeof node.url === 'string' && node.url.trim().length > 0
   
   // DEBUG DETTAGLIATO - Log del nodo per verificare i dati
   useEffect(() => {
      console.log("🔍 [List/ViewNode] DEBUG DETTAGLIATO:", {
         nodeKey: node.key,
         nodeUser: node.user,
         nodeUserType: node.userType,
         rawUrl: node?.url,
         urlType: typeof node?.url,
         urlTrimmed: node?.url ? node.url.trim() : null,
         hasValidUrl: hasValidUrl,
         allNodeData: node
      });
   }, [node, hasValidUrl]);

   const derefNode = () => {
      if (!node.key) {
         return
      }
      gun.get(namespace + '/node')
         .get(node.key)
         .put(null, (awk) => {
            onNodeRemoved(node.key)
         })
   }

   useEffect(() => {
      if (keypressed === 'v') {
         showAdvanced((isShowAdvanced) => !isShowAdvanced)
      }
   }, [keypressed])

   const onPostClicked = (event) => {
      //checks to see if it was double click
      if (event.detail <= 1) {
         return
      }
      // if there's a url, let's open it!
      if (node.url) {
         return window.open(node.url, '_blank')
      }
      return navigate(`/node/${node.key}`)
   }

   function stripHtml(input: string) {
      let doc = new DOMParser().parseFromString(input, 'text/html')
      return doc.body.textContent || ''
   }
   const trimWithEllip = (input: string = '', length: number) => {
      return input.length > length ? input.substring(0, length) + '...' : input
   }

   return (
      <ViewNodeStyled onClick={onPostClicked}>
         {head && (
            <HeadLink to={`/node/${node.head}`}>
               re: {trimWithEllip(stripHtml(head.message), 20)}
            </HeadLink>
         )}
         {node.directionText && <Title>{node.directionText}</Title>}
         {node.message && (
            <Message
               dangerouslySetInnerHTML={{
                  __html: node.message || '',
               }}
            ></Message>
         )}
         <br />
         <Menu>
            {node.user && (
               <Username 
                  className={node.userType === 'shogun' ? 'shogun-user' : ''}
                  onClick={(e) => {
                     e.stopPropagation()
                     navigate(`/profile/${encodeURIComponent(node.user)}`)
                  }}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  title={`Vedi tutti i contenuti di ${node.user}`}
               >
                  @{node.user}
                  {node.userType === 'shogun' && (
                     <span className="verified-badge">✓</span>
                  )}
               </Username>
            )}
            {node.date && <TimeAgo date={node.date}></TimeAgo>}
            <ViewCount count={views} />
            
            {hasValidUrl && (
               <div className="ogLink">
                  <a href={node.url} target="_blank" rel="noopener noreferrer">
                     og-link
                  </a>
               </div>
            )}

            <div className="nodeLink">
               <Link to={'/node/' + node.key}>node-link</Link>
            </div>
            {isShowAdvanced && (
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
