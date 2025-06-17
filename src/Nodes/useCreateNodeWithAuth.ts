import { useState } from 'react'
import gun, { namespace } from '../api/gun'
import { useAuth } from '../utils/AuthContext'

const useCreateNodeWithAuth = (onNodeCreated?: (node: any) => void, model: string = 'node') => {
   const [loading, setLoading] = useState<boolean>(false)
   const [node, setNode] = useState<any | undefined>()
   const auth = useAuth()

   const createNode = (data: any) => {
      console.log(`creating node with auth`)
      console.log(data)
      if (!data) {
         return
      }
      const key = data.key || data.id;
      if (!key) {
         throw new Error('Key or ID is required')
      }
      
      // Aggiungi automaticamente l'autore del nodo
      const enrichedData = {
         ...data,
         user: auth.isAuthenticated 
            ? (auth.userPub || auth.currentUsername || 'shogun_user')
            : (auth.currentUsername || 'anonymous'),
         userType: auth.isAuthenticated ? 'shogun' : 'guest',
         userPub: auth.isAuthenticated ? auth.userPub : undefined,
         userId: auth.isAuthenticated ? auth.userPub : undefined,
         timestamp: Date.now()
      }
      
      setLoading(true)

      gun.get(`${namespace}/${model}`)
         .get(key)
         .put(enrichedData, (awk) => {
            setLoading(false)
            setNode(enrichedData)
            if (onNodeCreated) {
               onNodeCreated(enrichedData)
            }
            console.log('Node created with auth info:', awk)
         })
   }

   // Funzione sicura per eliminare nodi con verifica autorizzazione
   const deleteNodeSecure = (key: string, fullDelete: boolean = false) => {
      if (!key) {
         throw new Error('Key is required for deletion')
      }
      
      setLoading(true)
      
      // Prima di cancellare, verifica l'autorizzazione leggendo il nodo
      gun.get(`${namespace}/${model}`)
         .get(key)
         .once((data: any) => {
            if (!data) {
               console.error('❌ Nodo non trovato per la cancellazione')
               setLoading(false)
               return
            }
            
            // Verifica autorizzazione
            const isAuthorized = 
               (auth.userPub && data.userPub === auth.userPub) || // Utente Shogun
               (auth.currentUsername && data.user === auth.currentUsername && !data.userPub) // Guest locale
            
            if (!isAuthorized) {
               console.error('❌ Non autorizzato a cancellare questo nodo')
               alert('❌ Non sei autorizzato a cancellare questo nodo!')
               setLoading(false)
               return
            }
            
            console.log('✅ Autorizzazione confermata per cancellazione nodo')
            
            if (fullDelete) {
               // Archivia prima di cancellare completamente
               gun.get(`${namespace}/archive`).get(key).put({
                  ...data,
                  deletedAt: Date.now(),
                  deletedBy: auth.userPub || auth.currentUsername,
                  deletionType: 'full'
               })
               
               // Cancella completamente
               gun.get(`${namespace}/${model}`)
                  .get(key)
                  .put(null as any, () => {
                     console.log('✅ Nodo eliminato completamente')
                     setLoading(false)
                  })
            } else {
               // Solo scollegamento - questo dovrebbe essere gestito dal componente padre
               console.log('ℹ️ Scollegamento nodo richiesto')
               setLoading(false)
            }
         })
   }

   return [createNode, loading, node, deleteNodeSecure] as const
}

export default useCreateNodeWithAuth