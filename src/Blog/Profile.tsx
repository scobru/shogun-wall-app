import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Label, FormItem } from '../Interface'
import { useAuth } from '../utils/AuthContext'
import { useNavigate } from 'react-router-dom'
import gun, { namespace } from '../api/gun'
import { formatPublicKey } from '../utils/usernameMap'

const Profile = () => {
   const auth = useAuth()
   const navigate = useNavigate()
   const [saving, setSaving] = useState(false)
   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
   
   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
   } = useForm()

   useEffect(() => {
      document.title = 'Profile - HAL 9000'
   }, [])

   // Non reindirizzare automaticamente - permetti l'accesso per impostare username
   // useEffect(() => {
   //    if (!auth.hasAnyAuth) {
   //       console.log('🚫 Profile: No authentication, redirecting to blog')
   //       navigate('/blog')
   //    }
   // }, [auth.hasAnyAuth, navigate])

   // Imposta i valori iniziali del form
   useEffect(() => {
      if (auth.currentUsername) {
         setValue('username', auth.currentUsername)
      }
   }, [auth.currentUsername, setValue])

   const onSubmit = async (data: any) => {
      if (!data.username?.trim()) {
         setMessage({ type: 'error', text: 'Username non può essere vuoto' })
         return
      }

      // Valida username (no spazi, lunghezza minima)
      const username = data.username.trim()
      if (username.length < 3) {
         setMessage({ type: 'error', text: 'Username deve essere almeno 3 caratteri' })
         return
      }

      if (username.includes(' ')) {
         setMessage({ type: 'error', text: 'Username non può contenere spazi' })
         return
      }

      setSaving(true)
      setMessage(null)

      try {
         if (auth.isAuthenticated && auth.userPub) {
            // Per utenti Shogun autenticati, salva il nuovo username mappato alla pub key
            await new Promise<void>((resolve, reject) => {
               gun.get(`${namespace}/username_maps`)
                  .get(auth.userPub!)
                  .put({
                     username: username,
                     updatedAt: Date.now(),
                     publicKey: auth.userPub
                  }, (ack: any) => {
                     if (ack.err) {
                        reject(new Error(String(ack.err)))
                     } else {
                        console.log('✅ Username aggiornato per pub key:', username)
                        resolve()
                     }
                  })
            })

            setMessage({ type: 'success', text: 'Username aggiornato con successo!' })
            
            // Aggiorna l'username nell'AuthContext senza ricaricare la pagina
            await auth.refreshUsername()
            
            // Reset del form con il nuovo valore
            setValue('username', '')

         } else {
            // Per guest user, aggiorna localStorage
            auth.setLocalUsername(username)
            setMessage({ type: 'success', text: 'Username guest aggiornato!' })
         }

      } catch (error) {
         console.error('❌ Errore aggiornamento username:', error)
         setMessage({ 
            type: 'error', 
            text: 'Errore durante il salvataggio. Riprova.' 
         })
      } finally {
         setSaving(false)
      }
   }

   // Loading state while auth is loading
   if (auth.loading) {
      return (
         <div className="profile-container">
            <div className="text-center py-20">
               <div className="loading loading-spinner loading-lg"></div>
               <p className="mt-4">Caricamento profilo...</p>
            </div>
         </div>
      )
   }

   return (
      <div className="profile-container max-w-2xl mx-auto">
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Profilo Utente</h1>
            <Button 
               variant="outline" 
               onClick={() => navigate('/blog')}
            >
               ← Torna al Blog
            </Button>
         </div>

         {/* Authentication prompt for full features */}
         {!auth.hasAnyAuth && (
            <div className="alert alert-info mb-6">
               <div>
                  <h3 className="font-semibold">👤 Modalità Guest</h3>
                  <p>Puoi impostare un username guest qui sotto. Per funzionalità complete, considera di autenticarti.</p>
                  <div className="flex gap-2 mt-3">
                     <Button onClick={auth.redirectToAuth} variant="primary" size="sm">
                        Accedi con Shogun
                     </Button>
                  </div>
               </div>
            </div>
         )}

         {/* User Info Card */}
         <div className="card bg-base-200 border border-base-300 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Informazioni Account</h2>
            
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <span className="font-medium">Tipo Account:</span>
                  <span className={`badge ${auth.isLoggedIn ? 'badge-success' : 'badge-neutral'}`}>
                     {auth.isLoggedIn ? 'Shogun ✓' : 'Guest'}
                  </span>
               </div>
               
               {auth.userPub && (
                  <div className="flex justify-between items-center">
                     <span className="font-medium">Public Key:</span>
                     <span className="font-mono text-sm break-all">
                        {formatPublicKey(auth.userPub, 24)}
                     </span>
                  </div>
               )}
               
               <div className="flex justify-between items-center">
                  <span className="font-medium">Username Attuale:</span>
                  <span className="font-medium text-primary">
                     {auth.currentUsername || 'Non impostato'}
                  </span>
               </div>
            </div>
         </div>

         {/* Edit Username Form */}
         <div className="card bg-base-100 border border-base-300 p-6">
            <h2 className="text-lg font-semibold mb-4">
               {auth.currentUsername ? 'Modifica Username' : 'Imposta Username'}
            </h2>
            
            {message && (
               <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
                  {message.text}
               </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <FormItem error={!!errors.username}>
                  <Label required>
                     {auth.currentUsername ? 'Nuovo Username:' : 'Username:'}
                  </Label>
                  <Input
                     {...register('username', {
                        required: 'Username è obbligatorio',
                        minLength: {
                           value: 3,
                           message: 'Username deve essere almeno 3 caratteri'
                        },
                        pattern: {
                           value: /^[a-zA-Z0-9_-]+$/,
                           message: 'Username può contenere solo lettere, numeri, _ e -'
                        }
                     })}
                     placeholder="Inserisci il tuo username..."
                  />
                  {errors.username && (
                     <div className="text-error text-xs mt-1">
                        {errors.username.message as string}
                     </div>
                  )}
               </FormItem>

               <div className="text-xs text-base-content/70">
                  📝 <strong>Nota:</strong> 
                  {auth.isLoggedIn 
                     ? ' Il nuovo username sarà associato alla tua public key e sarà utilizzato in tutti i tuoi post.'
                     : ' Come guest, il username sarà salvato solo localmente su questo browser.'
                  }
               </div>

               <div className="flex gap-3 pt-4">
                  <Button
                     type="submit"
                     variant="primary"
                     disabled={saving || Object.keys(errors).length > 0}
                     loading={saving}
                     className="flex-1"
                  >
                     {saving ? 'Salvando...' : (auth.currentUsername ? 'Aggiorna Username' : 'Imposta Username')}
                  </Button>
                  
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => navigate('/blog')}
                     disabled={saving}
                  >
                     Annulla
                  </Button>
               </div>
            </form>

            {/* Logout Section */}
            {auth.isLoggedIn && (
               <>
                  <div className="divider my-6"></div>
                  <div className="text-center">
                     <Button 
                        variant="error" 
                        onClick={auth.logout}
                        disabled={saving}
                     >
                        🚪 Logout
                     </Button>
                  </div>
               </>
            )}
         </div>
      </div>
   )
}

export default Profile
