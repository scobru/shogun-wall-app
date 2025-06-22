import gun, { namespace } from '../api/gun'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { DungeonNode, GunId, NewSubNode, DashboardItem } from '.'
import {
   NewNodeWrapper,
   MessageDate,
   MessageTop,
   MessageWrapper,
   Username,
} from './ViewNode.styled'
import LoadingWheel from '../Interface/LoadingWheel'
import useKeyboard from '../utils/useKeyboard'
import { StartEnd } from './DashboardItem'
import TipTap from '../Interface/TipTap'
import useListen from '../api/useListen'
import debounce from 'lodash.debounce'
import Time from './Time'
import styled from 'styled-components'
import { useAuth } from '../utils/AuthContext'

const DashboardView = ({ id }) => {
   const [directions, setDirections] = useState<DungeonNode[]>([])
   const [showHidden, setShowHidden] = useState<Boolean>(false)
   const [loading, setLoading] = useState<boolean>(true)
   const [error, setError] = useState<string | null>(null)
   const keypressed = useKeyboard(['h'])
   const node = useListen(id, 'node', true) as DungeonNode
   const navigate = useNavigate()

   // Debug logging per il nodo
   useEffect(() => {
      console.log('🔍 [Dashboard] Node data received:', {
         id,
         node,
         hasNode: !!node,
         nodeKeys: node ? Object.keys(node) : [],
         directionText: node?.directionText,
         message: node?.message
      })

      if (node) {
         setLoading(false)
         setError(null)
      } else if (id && !node) {
         // Se abbiamo un ID ma non il nodo dopo qualche secondo, mostra errore
         const timer = setTimeout(() => {
            if (!node) {
               setError(`Nodo con ID "${id}" non trovato`)
               setLoading(false)
            }
         }, 3000)
         return () => clearTimeout(timer)
      }
   }, [node, id])

   useEffect(() => {
      if (keypressed === 'h') {
         setShowHidden(!showHidden)
      }
   }, [keypressed])

   const sortDirections = (a: any, b: any): number => {
      const cleanInput = (text: any) => (!!text ? text : 0)
      const theyAreEqual = cleanInput(b.upVotes) === cleanInput(a.upVotes)
      if (theyAreEqual) return b.directionText > a.directionText ? 1 : -1

      return cleanInput(b.upVotes) > cleanInput(a.upVotes) ? 1 : -1
   }

   const insertDirection = (node: DungeonNode | any, key: string) => {
      setDirections((prev: DungeonNode[]) => {
         const withoutCurrent = prev.filter((stateNode) => stateNode.id !== key)
         return [...withoutCurrent, { ...node, id: key }].sort(sortDirections)
      })
   }

   useEffect(() => {
      setDirections([])
      const directionListeners: any[] = []
      const d = gun
         .get(namespace + '/node')
         .get(id)
         .get('directions')
         .map()
         .on((message: any, key: string) => {
            if (!showHidden && message === null) {
               return
            }
            const chain = gun
               .get(namespace + '/node')
               .get(key)
               .on(insertDirection)
            directionListeners.push(chain)
         })
      return () => {
         d.off()
         directionListeners.map((chain) => chain.off())
      }
   }, [showHidden, id])

   const onMessageChange = (value: string) => {
      console.log(`setting value to message id:${id}`, value)
      gun.get(namespace + '/node')
         .get(id)
         .get('message')
         .put('' + value, (awk: any) => {
            console.log(`saved message`, awk)
         })
   }
   const debouncedOnMessageChange = useMemo(
      () => debounce(onMessageChange, 3000),
      [id]
   )

   useEffect(() => {
      return () => {
         debouncedOnMessageChange.cancel()
      }
   }, [id])

   const pruneRight = (idToDelete: GunId, fullDelete: boolean = false) => {
      setDirections(directions.filter((node) => node.id !== idToDelete))

      gun.get(namespace + '/node')
         .get(id)
         .get(`directions`)
         .get(idToDelete)
         .put(null as any, (awk: any) => {
            console.log(awk)
         })
      if (fullDelete) {
         console.log(`full delete`, fullDelete)
         gun.get(namespace + '/node')
            .get(idToDelete)
            .put(null as any, (awk: any) => {
               console.log(`deleted node`, awk)
            })
      }
   }

   const nodeAdded = () => {
      console.log(`i'm in view node`)
   }

   const dateFormatted = useMemo(() => {
      if (!node?.date) return ''
      const date = new Date(node?.date)

      return `${date.toLocaleDateString()}`
   }, [node?.date])

   // Se c'è un errore, mostra messaggio di errore
   if (error) {
      return (
         <ErrorContainer>
            <h2>❌ Errore</h2>
            <p>{error}</p>
            <p>
               <strong>ID richiesto:</strong> <code>{id}</code>
            </p>
            <p>Verifica che l'ID del nodo sia corretto e che il nodo esista nel database.</p>
            <Link to="/dashboard" style={{ 
               color: '#007bff', 
               textDecoration: 'none',
               padding: '8px 16px',
               border: '1px solid #007bff',
               borderRadius: '4px',
               display: 'inline-block',
               marginTop: '10px'
            }}>
               ← Torna alla dashboard principale
            </Link>
         </ErrorContainer>
      )
   }

   // Se stiamo caricando, mostra loading
   if (loading) {
      return (
         <LoadingContainer>
            <LoadingWheel />
            <p>Caricamento nodo: <code>{id}</code></p>
         </LoadingContainer>
      )
   }

   return (
      <>
         {/* Header Modalità Editing */}
         <EditingHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>✏️</span>
                  <div>
                     <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                        Modalità Editing
                     </h1>
                     <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>
                        Modifica in tempo reale - Le modifiche vengono salvate automaticamente
                     </p>
                  </div>
               </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
               <button
                  onClick={() => navigate(`/node/${id}`)}
                  style={{
                     padding: '6px 12px',
                     backgroundColor: '#6c757d',
                     color: 'white',
                     border: 'none',
                     borderRadius: '4px',
                     fontSize: '12px',
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '4px'
                  }}
                  title="Visualizza questo nodo in modalità lettura"
               >
                  👁️ Visualizza
               </button>
               
               <button
                  onClick={() => navigate('/all')}
                  style={{
                     padding: '6px 12px',
                     backgroundColor: '#28a745',
                     color: 'white',
                     border: 'none',
                     borderRadius: '4px',
                     fontSize: '12px',
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '4px'
                  }}
                  title="Torna alla lista di tutti i contenuti"
               >
                  📋 Lista
               </button>
            </div>
         </EditingHeader>

         <div style={{ display: 'flex' }}>
            {/* <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(node, null, 3)}
                </pre> */}
            <Time style={{ padding: '10px 30px 0 30px', maxWidth: '500px' }} />
         </div>
         
         <MessageWrapper className="messageWrapper">
            {node?.head && (
               <Link to={`/dashboard/${node.head}`}>d/{node.head}</Link>
            )}
            <MessageTop className="messageTop">
               <h2>
                  <Username>{node?.directionText || 'Nodo senza titolo'}</Username>
               </h2>
               {!node?.user && <LoadingWheel />}
               {dateFormatted && (
                  <MessageDate className="messageDate">
                     {dateFormatted}
                  </MessageDate>
               )}
               {!dateFormatted && <LoadingWheel />}
            </MessageTop>

            {node?.message && (
               <>
                  <div style={{ marginTop: 10 }}>
                     <StartEnd 
                        start={node.start || ''}
                        end={node.end || ''}
                     />
                  </div>
                  <TipTap
                     onChange={debouncedOnMessageChange}
                     content={node.message}
                     hideFormatting={true}
                  />
               </>
            )}

            {!node?.message && <LoadingWheel />}
         </MessageWrapper>

         {directions?.map((node, index) => (
            <DashboardItem
               key={index}
               id={node.id}
               node={node}
               pruneRight={pruneRight}
               onUpdate={insertDirection}
            />
         ))}

         <NewNodeWrapper>
            <NewSubNode
               head={id}
               nodeAdded={nodeAdded}
               dashboardFeature={true}
            />
         </NewNodeWrapper>
      </>
   )
}

const EditingHeader = styled.div`
   background: linear-gradient(135deg, #007bff, #0056b3);
   color: white;
   padding: 16px 20px;
   border-radius: 8px;
   margin-bottom: 20px;
   display: flex;
   justify-content: space-between;
   align-items: center;
   box-shadow: 0 2px 8px rgba(0,123,255,0.2);
   border: 1px solid #0056b3;
   
   @media (max-width: 768px) {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
   }
`



const ErrorContainer = styled.div`
   background: #f8d7da;
   color: #721c24;
   padding: 20px;
   border-radius: 8px;
   margin: 20px 0;
   border: 1px solid #f5c6cb;
   text-align: center;
   
   h2 {
      margin-top: 0;
      color: #721c24;
   }
   
   code {
      background: #fff3cd;
      color: #856404;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
   }
`

const LoadingContainer = styled.div`
   text-align: center;
   padding: 40px 20px;
   color: #666;
   
   p {
      margin-top: 15px;
      font-size: 0.9em;
   }
   
   code {
      background: #f8f9fa;
      color: #495057;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
   }
`

const DashboardStyled = styled.div`
   max-width: 1000px;
   width: 100%;
   margin: 0 auto;
   padding: 1rem;
   overflow-wrap: anywhere;
   
   @media (min-width: 768px) {
      padding: 1.5rem;
   }
`

const Dashboard = () => {
   const { key } = useParams()
   
   useEffect(() => {
      console.log('🚀 [Dashboard] Route params:', { key })
      document.title = `Dashboard ${key?.substring(0, 50)}`
   }, [key])

   // Se non abbiamo una key, mostra messaggio di errore
   if (!key) {
      return (
         <DashboardStyled>
            <ErrorContainer>
               <h2>❌ Errore</h2>
               <p>Nessun ID del nodo specificato nell'URL</p>
               <p>L'URL dovrebbe essere nel formato: <code>/dashboard/[ID_NODO]</code></p>
               <Link to="/nodes" style={{ 
                  color: '#007bff', 
                  textDecoration: 'none',
                  padding: '8px 16px',
                  border: '1px solid #007bff',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: '10px'
               }}>
                  ← Vedi tutti i nodi
               </Link>
            </ErrorContainer>
         </DashboardStyled>
      )
   }

   return <DashboardStyled><DashboardView id={key} /></DashboardStyled>
}

export default Dashboard
