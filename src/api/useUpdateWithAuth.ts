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
      
      // Remove undefined properties to prevent Gun.js errors
      const cleanData = Object.keys(data).reduce((acc, key) => {
         if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
            acc[key] = data[key]
         }
         return acc
      }, {})
      
      // Aggiungi automaticamente l'autore del post
      const enrichedData: any = {
         ...cleanData,
         user: auth.isAuthenticated 
            ? (auth.userPub || auth.currentUsername || 'shogun_user')
            : (auth.currentUsername || 'anonymous'),
         userType: auth.isAuthenticated ? 'shogun' : 'guest',
         timestamp: Date.now()
      }
      
      // Add optional fields only if they exist and are valid
      if (auth.isAuthenticated && auth.userPub) {
         enrichedData.userPub = auth.userPub
         enrichedData.userId = auth.userPub
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