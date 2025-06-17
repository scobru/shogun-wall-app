import { useState } from 'react'
import gun, { namespace } from './gun'
import { useAuth } from '../utils/AuthContext'

const useUpdateWithAuth = (model: string = 'node') => {
   const [loading, setLoading] = useState<boolean>(false)
   const [node, setNode] = useState<any | undefined>()
   const auth = useAuth()

   const createNode = (data: any) => {
      console.log(`creating node`)
      console.log(data)
      if (!data) {
         return
      }
      if (!data.key) {
         throw new Error('Key is required')
      }
      
      // Aggiungi automaticamente l'autore del post
      const enrichedData = {
         ...data,
         user: auth.isAuthenticated 
            ? (auth.userPub || auth.currentUsername || 'shogun_user')
            : (auth.currentUsername || 'anonymous'),
         userType: auth.isAuthenticated ? 'shogun' : 'guest',
         userPub: auth.isAuthenticated ? auth.userPub : undefined,
         userId: auth.isAuthenticated ? auth.userPub : undefined, // Usa pub come ID
         timestamp: Date.now()
      }
      
      setLoading(true)

      gun.get(`${namespace}/${model}`)
         .get(data.key)
         .put(enrichedData, (awk) => {
            setLoading(false)
            setNode(enrichedData)
            console.log('Node created with auth info:', awk)
         })
   }

   return [createNode, loading, node]
}

export default useUpdateWithAuth 