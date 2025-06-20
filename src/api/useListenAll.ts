import { DungeonNode } from 'Nodes'
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import gun, { namespace } from './gun'

// Gestione globale dei listener per prevenire duplicazioni
const globalListeners = new Map<string, {
   listener: any
   subscribers: Set<(nodes: DungeonNode[]) => void>
   nodes: Map<string, DungeonNode>
   isActive: boolean
}>()

// Funzione per gestire gli aggiornamenti batch
let batchTimeouts = new Map<string, NodeJS.Timeout>()

const updateSubscribers = (model: string, nodes: DungeonNode[]) => {
   const listenerData = globalListeners.get(model)
   if (!listenerData) return

   // Ordina per timestamp decrescente
   const sortedNodes = nodes
      .filter(node => node && typeof node === 'object')
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

   // Notifica tutti i subscriber
   listenerData.subscribers.forEach(callback => {
      try {
         callback(sortedNodes)
      } catch (error) {
         console.error(`❌ Errore callback subscriber ${model}:`, error)
      }
   })
}

const startGlobalListener = (model: string) => {
   if (globalListeners.has(model) && globalListeners.get(model)!.isActive) {
      return // Listener già attivo
   }

   console.log(`🔄 useListenAll inizializzazione per model: ${model}`)
   
   const nodes = new Map<string, DungeonNode>()
   const subscribers = new Set<(nodes: DungeonNode[]) => void>()
   
   // Test connessione Gun.js
   gun.get('test').put({ timestamp: Date.now() }, (ack: any) => {
      if (ack && typeof ack === 'object' && 'err' in ack) {
         console.error('❌ Gun.js connection failed:', ack.err)
      } else {
         console.log('✅ Gun.js connection successful')
      }
   })

   const listener = gun.get(`${namespace}/${model}`).map().on((data: any, key: string) => {
      if (data === null || data === undefined) {
         // Rimuovi nodo eliminato
         if (nodes.has(key)) {
            nodes.delete(key)
            
            // Batch update per evitare troppi aggiornamenti
            const existingTimeout = batchTimeouts.get(model)
            if (existingTimeout) clearTimeout(existingTimeout)
            
            batchTimeouts.set(model, setTimeout(() => {
               console.log(`📥 useListenAll batch update: ${model}, updates: ${nodes.size}`)
               updateSubscribers(model, Array.from(nodes.values()))
               batchTimeouts.delete(model)
            }, 50))
         }
         return
      }

      // Verifica se è un cambiamento reale
      const existingNode = nodes.get(key)
      const dataString = JSON.stringify(data)
      
      if (existingNode && JSON.stringify(existingNode) === dataString) {
         return // Nessun cambiamento reale
      }

      // Aggiorna nodo
      nodes.set(key, { ...data, key })
      
      // Batch update per evitare troppi aggiornamenti
      const existingTimeout = batchTimeouts.get(model)
      if (existingTimeout) clearTimeout(existingTimeout)
      
      batchTimeouts.set(model, setTimeout(() => {
         console.log(`📥 useListenAll batch update: ${model}, updates: ${nodes.size}`)
         updateSubscribers(model, Array.from(nodes.values()))
         batchTimeouts.delete(model)
      }, 50))
   })

   globalListeners.set(model, {
      listener,
      subscribers,
      nodes,
      isActive: true
   })

   console.log(`✅ useListenAll listener started for model: ${model}`)
}

const stopGlobalListener = (model: string) => {
   const listenerData = globalListeners.get(model)
   if (!listenerData) return

   console.log(`🔄 useListenAll cleanup per model: ${model}`)
   
   // Pulisci timeout batch
   const existingTimeout = batchTimeouts.get(model)
   if (existingTimeout) {
      clearTimeout(existingTimeout)
      batchTimeouts.delete(model)
   }

   // Ferma listener
   if (listenerData.listener) {
      listenerData.listener.off()
   }

   // Rimuovi dalla mappa
   globalListeners.delete(model)
}

const forceRefreshListener = (model: string) => {
   console.log(`🔄 [useListenAll] Force refresh for model: ${model}`)
   
   // Ferma il listener esistente
   stopGlobalListener(model)
   
   // Riavvia immediatamente
   startGlobalListener(model)
   
   // Notifica i subscriber che il refresh è stato fatto
   const listenerData = globalListeners.get(model)
   if (listenerData && listenerData.nodes.size > 0) {
      updateSubscribers(model, Array.from(listenerData.nodes.values()))
   }
}

const useListenAll = (model: string = 'node', refreshKey?: number): DungeonNode[] => {
   const [nodes, setNodes] = useState<DungeonNode[]>([])
   const [isInitialized, setIsInitialized] = useState(false)
   const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
   const [hasData, setHasData] = useState(false)
   const [nodesCount, setNodesCount] = useState(0)
   const lastRefreshKey = useRef<number | undefined>(refreshKey)
   
   // Callback stabile per aggiornamenti
   const handleUpdate = useCallback((newNodes: DungeonNode[]) => {
      setNodes(prevNodes => {
         // Evita aggiornamenti inutili usando una comparazione più efficiente
         if (prevNodes.length === newNodes.length && 
             prevNodes.length > 0 && 
             newNodes.length > 0 &&
             prevNodes[0]?.key === newNodes[0]?.key) {
            return prevNodes
         }
         
         setNodesCount(newNodes.length)
         setHasData(newNodes.length > 0)
         setIsInitialized(true)
         setConnectionStatus('connected')
         
         return newNodes
      })
   }, [])

   // Gestisci il refresh forzato quando refreshKey cambia
   useEffect(() => {
      if (refreshKey !== undefined && refreshKey !== lastRefreshKey.current) {
         console.log(`🔄 [useListenAll] RefreshKey changed: ${lastRefreshKey.current} -> ${refreshKey}`)
         lastRefreshKey.current = refreshKey
         
         // Forza il refresh del listener
         forceRefreshListener(model)
      }
   }, [refreshKey, model])

   useEffect(() => {
      // Avvia listener globale se non esiste
      if (!globalListeners.has(model) || !globalListeners.get(model)!.isActive) {
         startGlobalListener(model)
      }

      const listenerData = globalListeners.get(model)
      if (!listenerData) return

      // Aggiungi questo componente ai subscriber
      listenerData.subscribers.add(handleUpdate)

      // Invia dati esistenti se disponibili
      if (listenerData.nodes.size > 0) {
         const existingNodes = Array.from(listenerData.nodes.values())
         handleUpdate(existingNodes)
      }

      // Cleanup
      return () => {
         const currentListenerData = globalListeners.get(model)
         if (currentListenerData) {
            currentListenerData.subscribers.delete(handleUpdate)
            
            // Se non ci sono più subscriber, ferma il listener
            if (currentListenerData.subscribers.size === 0) {
               stopGlobalListener(model)
            }
         }
      }
   }, [model, handleUpdate])

   // Debug logging ottimizzato
   useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
         console.log(`📊 useListenAll stato:`, {
            model,
            nodesCount,
            isInitialized,
            connectionStatus,
            hasData,
            refreshKey,
            firstNodeKey: nodes[0]?.key || 'none'
         })
      }
   }, [model, nodesCount, isInitialized, connectionStatus, hasData, refreshKey, nodes])

   return nodes
}

export default useListenAll 