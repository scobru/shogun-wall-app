import { useNavigate } from 'react-router-dom'
import useDelete from '../api/useDelete'
import { useAuth } from '../utils/AuthContext'

const usePostClicked = () => {
   const [deleteNode] = useDelete('post', true)
   const navigate = useNavigate()
   const auth = useAuth()

   const postClicked = (key: string | undefined, { metaKey, altKey }) => {
      if (!key) {
         throw new Error(`Key is expected in this function`)
      }
      if (metaKey) {
         const confirmationText =
            'Are you sure you would like to delete this post?'
         if (window.confirm(confirmationText) === true) {
            // Passa i parametri di autenticazione corretti
            deleteNode(key, auth.userPub || undefined, auth.currentUsername || undefined)
         }
         return
      }
      if (altKey) {
         navigate(`/post/edit/${key}`)
         return
      }
      navigate(`/blog/${key}`)
   }

   return postClicked
}

export default usePostClicked
