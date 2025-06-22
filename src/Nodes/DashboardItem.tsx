import styled from 'styled-components/macro'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { SimpleIcon, Styles } from '../Interface'
import { ITEM_BORDER } from './ViewNode.styled'
import { DungeonNode, GunId } from '.'
import useUpdate from '../api/useUpdate'
import { useAuth } from '../utils/AuthContext'
import { formatAuthorDisplay } from '../utils/usernameMap'

export const NodeLink = styled(Link)`
   padding: 1rem 1rem;
   margin: 0 1rem 0 0;
   border: ${ITEM_BORDER};
   flex-grow: 2;
`

type NodeRowProps = {
   key: string | number
   id: string
   node: DungeonNode
   pruneRight: (id: GunId, fullDelete?: boolean) => void
   onUpdate: (node: DungeonNode, key: GunId) => void
}

const StartEndStyed = styled.div`
   display: flex;
   align-items: flex-start;
   padding: 1px 20px 1px 5px;
   width: 20%;
   max-width: 10rem;
   justify-content: space-between;
`
type StartEndProps = {
   start: string
   end: string
}
export const StartEnd = ({ start, end }: StartEndProps) => {
   if (!start && !end) return null
   return (
      <StartEndStyed>
         <div>{start && start}</div>
         <div>{start && end && '-'}</div>
         <div>{end && end}</div>
      </StartEndStyed>
   )
}

const Tools = styled.div`
   display: flex;
   justify-content: end;
   align-items: flex-start;
   margin-left: 10px;
   .simpleIcon {
      border: none;
   }
`

const NodeActions = styled.div`
   display: flex;
   gap: 6px;
   margin-top: 8px;
   
   .node-action-btn {
      padding: 3px 8px;
      font-size: 10px;
      border: 1px solid #ddd;
      border-radius: 3px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
         background: #f8f9fa;
      }
      
      &.delete-btn:hover {
         border-color: #dc3545;
         color: #dc3545;
      }
      
      &.delete-full-btn:hover {
         border-color: #721c24;
         color: #721c24;
         background: #f8d7da;
      }
   }
`

const Title = styled.div`
   flex: 1;
   font-size: 18px;
   font-weight: 600;
   cursor: pointer;
`

const UserInfo = styled.div`
   font-size: 12px;
   color: #666;
   margin-bottom: 5px;
   display: flex;
   align-items: center;
   gap: 6px;
   
   .user-name {
      font-weight: 500;
      color: #333;
   }
   
   .shogun-badge {
      background: #28a745;
      color: white;
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 8px;
      font-weight: bold;
   }
   
   .guest-badge {
      background: #6c757d;
      color: white;
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 8px;
      font-weight: bold;
   }
`

const MessageStyled = styled.div`
   flex: 1;
`
const Message = ({ message }: Pick<DungeonNode, 'message'>) => {
   return <MessageStyled dangerouslySetInnerHTML={{ __html: message }} />
}

export const LinkWrapper = styled.div`
   padding: 0.5rem 2rem;
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   ${MessageStyled} {
      margin-bottom: 0px;
   }
`

const DashboardItem = ({ id, pruneRight, node, onUpdate }: NodeRowProps) => {
   const [createNode] = useUpdate('node')
   const navigate = useNavigate()
   const auth = useAuth()

   // Debug logging per il nodo
   useEffect(() => {
      console.log('🔍 [DashboardItem] Node data:', {
         id,
         node,
         hasNode: !!node,
         directionText: node?.directionText,
         user: node?.user,
         message: node?.message
      })
   }, [id, node])

   // Se non abbiamo dati del nodo, mostra placeholder
   if (!node) {
      return (
         <LinkWrapper className="linkWrapper">
            <div style={{ flex: 1, padding: '10px', color: '#999', fontStyle: 'italic' }}>
               Caricamento nodo {id}...
            </div>
         </LinkWrapper>
      )
   }

   const itemClicked = (id: string) => {
      if (id) {
         navigate(`/dashboard/${id}`)
      }
   }

   const upVote = (node) => {
      const upVotes = node?.upVotes ? node?.upVotes + 1 : 1
      onUpdate({ ...node, upVotes }, id)
      createNode({ key: id, upVotes })
   }

   // Verifica se l'utente può modificare/cancellare il nodo
   const canEditNode = (node: DungeonNode) => {
      if (!node) return false
      // Se l'utente è autenticato con Shogun, può modificare solo i suoi nodi
      if (auth.isAuthenticated) {
         return node.userPub === auth.userPub || node.user === auth.username
      }
      // Se è guest, può modificare solo i nodi con lo stesso username locale
      return node.user === auth.currentUsername
   }

   // Funzione per cancellare collegamento nodo
   const handleDeleteLink = () => {
      const confirmText = `Rimuovere il collegamento a questo nodo?\n\n"${node.directionText || 'Nodo senza titolo'}"\n\nIl nodo rimarrà nel database ma non sarà più collegato qui.`
      if (window.confirm(confirmText)) {
         console.log(`🔗 Rimozione collegamento nodo: ${id}`)
         pruneRight(id, false)
      }
   }

   // Funzione per cancellare nodo completamente
   const handleDeleteNode = () => {
      const confirmText = `ATTENZIONE: Cancellare completamente questo nodo?\n\n"${node.directionText || 'Nodo senza titolo'}"\n\nQuesta azione eliminerà il nodo dal database e NON PUÒ essere annullata!`
      if (window.confirm(confirmText)) {
         console.log(`🗑️ Cancellazione completa nodo: ${id}`)
         pruneRight(id, true)
      }
   }

   return (
      <LinkWrapper className="linkWrapper">
         <StartEnd {...node} />

         <div style={{ flex: 1 }}>
            {/* Info utente */}
            <UserInfo>
               <span 
                  className="user-name"
                  onClick={(e) => {
                     e.stopPropagation()
                     if (node.user) {
                        navigate(`/profile/${encodeURIComponent(node.user)}`)
                     }
                  }}
                  style={{ 
                     cursor: node.user ? 'pointer' : 'default',
                     textDecoration: node.user ? 'underline' : 'none'
                  }}
                  title={node.user ? `Vedi tutti i contenuti di ${formatAuthorDisplay(node.user)}` : undefined}
               >
                  {formatAuthorDisplay(node.user || 'Unknown')}
               </span>
               {node.userType === 'shogun' && (
                  <span className="shogun-badge">SHOGUN</span>
               )}
               {node.userType === 'guest' && (
                  <span className="guest-badge">GUEST</span>
               )}
               {!node.userType && node.user && (
                  <span className="guest-badge">LEGACY</span>
               )}
               {node.timestamp && (
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#999' }}>
                     {new Date(node.timestamp).toLocaleDateString('it-IT', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                     })}
                  </span>
               )}
            </UserInfo>
            
            <Title onClick={() => itemClicked(id)}>
               {node.directionText || ``}
            </Title>

            <Message message={node.message} />
            
            {/* Azioni del nodo - mostra solo se l'utente può modificarlo */}
            {canEditNode(node) && (
               <NodeActions>
                  <button 
                     className="node-action-btn delete-btn"
                     onClick={handleDeleteLink}
                     title="Rimuovi collegamento (il nodo rimane nel database)"
                  >
                     Scollega
                  </button>
                  <button 
                     className="node-action-btn delete-full-btn"
                     onClick={handleDeleteNode}
                     title="CANCELLA COMPLETAMENTE il nodo dal database"
                  >
                     Elimina
                  </button>
               </NodeActions>
            )}
         </div>
         <Tools>
            {node?.upVotes}
            <SimpleIcon
               content="[ ⇧ ]"
               hoverContent={'[ ⇧ ]'}
               style={Styles.positive}
               className="simpleIcon"
               onClick={() => {
                  upVote(node)
               }}
            />
            {/* Manteniamo l'icona originale per compatibilità */}
            <SimpleIcon
               content="[ ␡ ]"
               hoverContent={'[ ␡ ] Click: scollega, Cmd+Click: elimina'}
               style={Styles.warning}
               className="simpleIcon"
               onClick={(event: MouseEvent) => {
                  if (event.metaKey) pruneRight(id, true)
                  pruneRight(id)
               }}
            />
         </Tools>
      </LinkWrapper>
   )
}

export default DashboardItem
