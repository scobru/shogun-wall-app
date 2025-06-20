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
import OGLinkPreview from '../components/OGLinkPreview'

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
      document.title = node?.directionText 
         ? `${node.directionText.substring(0, 50)}`
         : `View Post ${key.substring(0, 10)}`
   }, [node?.directionText, key])

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
      if (node?.head) {
         navigate(`/node/${node.head}`)
      } else {
         navigate('/all')
      }
   }

   const dateFormatted = useMemo(() => {
      if (!node?.date) return ''
      const date = new Date(node.date)
      return `${date.toLocaleDateString('it-IT')} ${date.toLocaleTimeString('it-IT', { 
         hour: '2-digit', 
         minute: '2-digit' 
      })}`
   }, [node?.date])

   const commentsCount = Object.keys(directions).length

   return (
      <ViewNodeStyled>
         {/* Header con navigazione */}
         <BackSectionWrapper className="blockSection">
            <BackButton onClick={goback}>
               ← {node?.head ? 'Torna al post padre' : 'Torna a tutti i post'}
            </BackButton>
            <ViewCount count={views} />
         </BackSectionWrapper>

         {/* Contenuto principale del post */}
         <MessageWrapper className="messageWrapper">
            {/* Titolo del post */}
            {node?.directionText && (
               <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  marginBottom: '16px',
                  color: 'var(--text-color)',
                  lineHeight: '1.3'
               }}>
                  {node.directionText}
               </div>
            )}

            {/* Info autore e data */}
            <MessageTop className="messageTop">
               {node?.user && (
                  <Username className={node?.userType === 'shogun' ? 'shogun-user' : ''}>
                     @{node?.user}
                     {node?.userType === 'shogun' && (
                        <span className="verified-badge">✓</span>
                     )}
                     {node?.userType === 'guest' && (
                        <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.7 }}>Guest</span>
                     )}
                  </Username>
               )}
               {!node?.user && <LoadingWheel />}
               
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {dateFormatted && (
                     <MessageDate className="messageDate">
                        {dateFormatted}
                     </MessageDate>
                  )}
                  {!dateFormatted && <LoadingWheel />}
                  
                  {/* Badge categoria */}
                  {node?.category && (
                     <div style={{
                        padding: '2px 8px',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                     }}>
                        {node.category}
                     </div>
                  )}
               </div>
            </MessageTop>

            {/* Hashtags */}
            {node?.hashtags && (
               <div style={{ 
                  marginBottom: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
               }}>
                  {node.hashtags.split(/\s+/).filter(tag => tag.trim()).map((tag, index) => (
                     <span 
                        key={index}
                        style={{
                           padding: '2px 6px',
                           backgroundColor: 'var(--gray-100)',
                           color: 'var(--gray-700)',
                           borderRadius: '8px',
                           fontSize: '11px',
                           fontWeight: '500'
                        }}
                     >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                     </span>
                  ))}
               </div>
            )}

            {/* OG Link Preview - migliorato */}
            {node?.url && (
               <div style={{ marginBottom: '20px' }}>
                  <OGLinkPreview url={node.url} compact={false} />
               </div>
            )}

            {/* Contenuto del messaggio */}
            {node?.message && (
               <Message
                  className="message"
                  dangerouslySetInnerHTML={createMarkup(node?.message)}
                  style={{
                     fontSize: '16px',
                     lineHeight: '1.6',
                     marginTop: '16px'
                  }}
               />
            )}

            {!node?.message && !node?.directionText && <LoadingWheel />}
         </MessageWrapper>

         {/* Sezione commenti */}
         <div style={{ marginTop: '32px' }}>
            <div style={{
               padding: '12px 16px',
               backgroundColor: 'var(--gray-50)',
               borderRadius: '8px',
               marginBottom: '16px',
               borderLeft: '4px solid var(--primary-500)'
            }}>
               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-color)' }}>
                  COMMENTI ({commentsCount})
               </h3>
               {commentsCount === 0 && (
                  <p style={{ margin: '8px 0 0 0', color: 'var(--gray-600)', fontSize: '14px' }}>
                     Sii il primo a commentare questo post
                  </p>
               )}
            </div>

            {/* Lista commenti */}
            {Object.keys(directions).map((key: string) => (
               <NodeRow
                  key={key}
                  directionKey={key}
                  directions={directions}
                  pruneRight={pruneRight}
               />
            ))}
         </div>

         {/* Form nuovo commento */}
         <NewNodeWrapper>
            <NewSubNode head={key} nodeAdded={nodeAdded} />
         </NewNodeWrapper>
      </ViewNodeStyled>
   )
}

export default ViewNode
