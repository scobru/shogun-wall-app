import gun, { namespace } from '../api/gun'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { DungeonNode, GunId, NewSubNode, NodeRow } from '.'
import {
   BackSectionWrapper,
   BackButton,
   NewNodeWrapper,
   ViewNode as ViewNodeStyled,
   Message,
   MessageDate,
   MessageTop,
   MessageWrapper,
   Username,
} from './ViewNode.styled'
import LoadingWheel from '../Interface/LoadingWheel'
import useKeyboard from '../utils/useKeyboard'
import { createMarkup, linkify } from '../utils'
import useViewCount from 'List/useViewCount'
import ViewCount from 'List/ViewCount'

/**
 *
 *          Why does the node have directions?
 *          this arose from thinking about being inside a dark forest / jungle
 *          without knowing where to go, what would you do? Like Hansel and
 *          Gretel we may leave little white pebbles through the forest
 *          to mark where we are. Each direction can be a new pebble
 *          which might remind you or the User about what you're doing here
 *          or why you're here.
 *
 */

const ViewNode = () => {
   const [node, setNode] = useState<DungeonNode | undefined>()
   const [directions, setDirections] = useState<any>({})
   const [showHidden, setShowHidden] = useState<Boolean>(false)
   const keypressed = useKeyboard(['h'])
   const { key = '' } = useParams()
   const [views] = useViewCount(key)
   const navigate = useNavigate()

   // init the page title
   useEffect(() => {
      document.title = `View Brick '${key.substring(0, 50)}`
   }, [])

   useEffect(() => {
      if (keypressed === 'h') {
         setShowHidden(!showHidden)
      }
   }, [keypressed])

   /**
    *    for when i make a new hook
    *    or when i write a new book
    *    REACT, THE PARTS THAT MATTER
    */
   useEffect(() => {
      setNode(undefined)
      const d = gun
         .get(namespace + '/node/' + key)
         .on((node: DungeonNode | any = {}) => {
            console.log('🔍 [Nodes/ViewNode] Nodo ricevuto:', node);
            console.log('🔍 [Nodes/ViewNode] URL nel nodo:', node?.url);
            setNode({ ...node })
         })
      return () => {
         d.off()
      }
   }, [key])

   // Function to load/refresh directions (comments)
   const loadDirections = () => {
      setDirections({})
      const d = gun
         .get(namespace + '/node')
         .get(key)
         .get('directions')
         .map()
         .on((message: any, key: any) => {
            if (!showHidden && message === null) {
               return
            }
            setDirections((prev: any) => {
               return { ...prev, [key]: message }
            })
         })
      return () => {
         d.off()
      }
   }

   /**
    *    WHY ARE THE "DIRECTIONS" HERE NOT
    *    LIVING DIRECTLY ON THE NODE ITSELF?
    *    well sir, that is because ________.
    */
   useEffect(() => {
      const cleanup = loadDirections()
      return cleanup
   }, [key, showHidden])

   const pruneRight = (id: GunId) => {
      const newDirections = { ...directions }
      delete newDirections[id]
      setDirections(newDirections)

      gun.get(namespace + '/node')
         .get(key) // we're accessing the current top node and removing the direction by key
         .get(`directions`)
         .get(id)
         .put(null as any, (awk: any) => {
            console.log(awk)
         })
   }

   const nodeAdded = () => {
      console.log(`Comment added to node ${key}`)
      // Refresh directions to show the new comment
      loadDirections()
   }

   const goback = () => {
      navigate(`/node/${node?.head}`)
   }

   const dateFormatted = useMemo(() => {
      if (!node?.date) return ''
      const date = new Date(node.date)

      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
   }, [node?.date])

   return (
      <ViewNodeStyled>
         <BackSectionWrapper className="blockSection">
            {node?.head && <BackButton onClick={goback}>{'< '}</BackButton>}
            {!node?.head && <div>&nbsp;</div>}
         </BackSectionWrapper>

         <MessageWrapper className="messageWrapper">
            <MessageTop className="messageTop">
               {node?.user && (
                  <Username className={node?.userType === 'shogun' ? 'shogun-user' : ''}>
                     @{node?.user}
                     {node?.userType === 'shogun' && (
                        <span className="verified-badge">✓</span>
                     )}
                  </Username>
               )}
               {!node?.user && <LoadingWheel />}
               {dateFormatted && (
                  <MessageDate className="messageDate">
                     {dateFormatted}
                  </MessageDate>
               )}
               {!dateFormatted && <LoadingWheel />}
               <ViewCount count={views} />
            </MessageTop>

            {/* OG Link - mostra solo se presente l'URL */}
            {node?.url && (
               <div style={{ 
                  marginBottom: '15px', 
                  padding: '8px 12px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '6px', 
                  border: '1px solid #e9ecef',
                  fontSize: '14px',
                  marginTop: '10px'
               }}>
                  <span style={{ fontWeight: 'bold', marginRight: '8px' }}>URL Esterno:</span>
                  <a 
                     href={node.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     style={{ color: '#0366d6', textDecoration: 'none' }}
                  >
                     {node.url}
                  </a>
               </div>
            )}

            {node?.message && (
               <Message
                  className="message"
                  dangerouslySetInnerHTML={createMarkup(node?.message)}
               />
            )}

            {!node?.message && <LoadingWheel />}
         </MessageWrapper>

         {Object.keys(directions).map((key: string) => (
            <NodeRow
               key={key}
               directionKey={key}
               directions={directions}
               pruneRight={pruneRight}
            />
         ))}

         <NewNodeWrapper>
            <NewSubNode head={key} nodeAdded={nodeAdded} />
         </NewNodeWrapper>
      </ViewNodeStyled>
   )
}

export default ViewNode
