import { useState } from 'react'
import gun, { namespace } from './gun'

const useDelete = (model: string = 'node', archive: boolean = false) => {
   const [loading, setLoading] = useState<boolean>(false)

   const performDelete = (key: string) => {
      gun.get(`${namespace}/${model}`)
         .get(key)
         .put(null as any, () => {
            setLoading(false)
         })
   }

   const deleteNode = (key: string, currentUserPub?: string, currentUsername?: string): void => {
      console.log(`delete node ${key}`)
      if (!key) {
         throw new Error('Key is required')
      }
      
      setLoading(true)
      
      // Prima di cancellare, verifica l'autorizzazione leggendo il post
      gun.get(`${namespace}/${model}`)
         .get(key)
         .once((data: any) => {
            if (!data) {
               console.error('❌ Post non trovato per la cancellazione')
               setLoading(false)
               return
            }
            
            // Debug dettagliato per l'autorizzazione
            console.log('🔍 [useDelete] Verifica autorizzazione:', {
               key,
               currentUserPub,
               currentUsername,
               dataUserPub: data.userPub,
               dataUser: data.user,
               dataUserType: data.userType
            })
            
            // Verifica autorizzazione
            const isAuthorized = 
               (currentUserPub && data.userPub === currentUserPub) || // Utente Shogun
               (currentUsername && data.user === currentUsername && !data.userPub) // Guest locale
            
            console.log('🔍 [useDelete] Risultato autorizzazione:', {
               isAuthorized,
               check1: currentUserPub && data.userPub === currentUserPub,
               check2: currentUsername && data.user === currentUsername && !data.userPub
            })
            
            if (!isAuthorized) {
               console.error('❌ Non autorizzato a cancellare questo post')
               alert('❌ Non sei autorizzato a cancellare questo post!')
               setLoading(false)
               return
            }
            
            console.log('✅ Autorizzazione confermata, procedo con la cancellazione')
            
            // Se archiviazione è richiesta
            if (archive) {
               gun.get(`${namespace}/archive`).get(key).put({
                  ...data,
                  deletedAt: Date.now(),
                  deletedBy: currentUserPub || currentUsername
               })
            }
            
            // Procedi con la cancellazione
            performDelete(key)
         })
   }

   return [deleteNode, loading] as const // see https://fettblog.eu/typescript-react-typeing-custom-hooks/
}

export default useDelete
