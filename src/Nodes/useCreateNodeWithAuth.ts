import { useState } from 'react'
import gun, { namespace } from '../api/gun'
import { useAuth } from '../utils/AuthContext'

// Funzione helper per rimuovere proprietà con valore undefined o null
const removeUndefinedProps = (obj) => {
   const newObj = {};
   Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined && obj[key] !== null) {
         newObj[key] = obj[key];
      }
   });
   return newObj;
};

const useCreateNodeWithAuth = (onNodeCreated?: (node: any) => void, model: string = 'node') => {
   const [loading, setLoading] = useState<boolean>(false)
   const [node, setNode] = useState<any | undefined>()
   const auth = useAuth()

   const createNode = (data: any) => {
      console.log(`🏗️ creating node with auth`)
      console.log('🏗️ Dati ricevuti dal form:', data)
      if (!data) {
         console.error('❌ Dati mancanti per la creazione del nodo')
         return
      }
      
      // Verifica che l'ID o la chiave non sia undefined
      const key = data.key || data.id;
      if (!key) {
         console.error('❌ Key o ID mancante')
         return
      }
      
      // Verifica che il messaggio non sia undefined
      if (data.message === undefined && !data.directionText) {
         console.error('❌ Il messaggio non può essere vuoto')
         data.message = "<p>Nessun messaggio</p>" // Imposta un valore predefinito
      }
      
      // Assicuriamoci che l'URL sia gestito correttamente
      let url: string | null = null;
      if (data.url && typeof data.url === 'string' && data.url.trim() !== '') {
         const trimmedUrl = data.url.trim();
         // Assicuriamoci che abbia un protocollo
         if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
            url = 'https://' + trimmedUrl;
         } else {
            url = trimmedUrl;
         }
      }
      
      // DEBUG DETTAGLIATO per URL
      console.log('🔗 ===== DEBUG URL DETTAGLIATO =====');
      console.log('🔗 URL originale dal form:', data.url);
      console.log('🔗 Tipo URL originale:', typeof data.url);
      console.log('🔗 URL dopo trim:', data.url ? data.url.trim() : null);
      console.log('🔗 URL finale elaborato:', url);
      console.log('🔗 Sarà incluso nei dati?', url ? 'SÌ' : 'NO');
      console.log('🔗 ================================');
      
      // Aggiungi automaticamente l'autore del nodo
      let enrichedData = {
         ...data,
         user: auth.isAuthenticated 
            ? (auth.currentUsername || auth.username || 'shogun_user')
            : (data.user || auth.currentUsername || 'anonymous'),
         userType: auth.isAuthenticated ? 'shogun' : 'guest',
         userPub: auth.isAuthenticated ? auth.userPub : null,
         userId: auth.isAuthenticated ? auth.userPub : null,
         date: Date.now(), // Ensure consistent date field
         timestamp: Date.now()
      }
      
      // Aggiungiamo l'URL solo se esiste e non è vuoto
      if (url && url !== '') {
         enrichedData.url = url;
         console.log('✅ URL aggiunto ai dati arricchiti:', url);
      } else {
         console.log('❌ Nessun URL valido fornito - verrà omesso dai dati');
      }
      
      // Rimuoviamo tutte le proprietà undefined che possono causare errori
      enrichedData = removeUndefinedProps(enrichedData);
      
      // Debug finale per verificare i dati arricchiti
      console.log('🏗️ ===== DATI FINALI PRIMA DEL SALVATAGGIO =====');
      console.log('🏗️ Dati completi:', enrichedData);
      console.log('🏗️ URL nei dati finali:', enrichedData.url);
      console.log('🏗️ ===============================================');
      
      setLoading(true)

      // Salva il nodo in GunDB
      gun.get(`${namespace}/${model}`)
         .get(key)
         .put(enrichedData, (awk: any) => {
            setLoading(false)
            
            // Verifica se ci sono stati errori
            if (awk && awk.err) {
               console.error('Errore nel salvataggio del nodo:', awk.err)
               return
            }
            
            console.log('Nodo salvato con successo:', awk)
            setNode(enrichedData)
            
            // Recupera il nodo salvato con gestione errori
            try {
               gun.get(`${namespace}/${model}`)
                  .get(key)
                  .once((savedNode) => {
                     if (!savedNode) {
                        console.warn('❌ Il nodo salvato è vuoto')
                        return
                     }
                     
                     console.log('🎯 ===== VERIFICA NODO SALVATO =====')
                     console.log('🎯 Nodo salvato:', savedNode)
                     console.log('🎯 URL nel nodo salvato:', savedNode.url)
                     console.log('🎯 Tipo URL nel nodo salvato:', typeof savedNode.url)
                     console.log('🎯 Ha URL valido?', savedNode.url ? 'SÌ' : 'NO')
                     console.log('🎯 ==================================')
                     
                     // Se questo è un commento (ha proprietà head), collegalo al post padre
                     if (data.head) {
                        console.log('Linking comment to parent post', data.head)
                        gun.get(`${namespace}/${model}`)
                           .get(data.head)
                           .get('directions')
                           .get(key)
                           .put(data.message || 'Comment', (dirAck) => {
                              console.log('Comment linked to parent post:', dirAck)
                           })
                     }
                     
                     // Esegui il callback se fornito
                     if (onNodeCreated) {
                        onNodeCreated(enrichedData)
                     }
                  })
            } catch (error) {
               console.error('Errore nel recupero del nodo salvato:', error)
            }
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