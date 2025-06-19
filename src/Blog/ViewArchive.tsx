import { DungeonNode } from 'Nodes'
import { useEffect } from 'react'
import useListenAll from '../api/useListenAll'
import { createMarkup } from '../utils'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'

const ViewArchive = () => {
   const posts = useListenAll('archive') as DungeonNode[]

   useEffect(() => {
      document.title = 'Archive'
   }, [])

   console.log('🗄️ ViewArchive Debug:', { posts, postsLength: posts?.length })

   if (!posts) return <div>Caricamento archivio...</div>
   
   if (posts.length === 0) return (
      <div className="p-5 text-center">
         <h3 className="text-lg font-semibold mb-2">Archivio vuoto</h3>
         <p className="mb-2">Non ci sono ancora post archiviati.</p>
         <p className="text-sm text-base-content/70">
            💡 <strong>Suggerimento:</strong> I post archiviati appaiono qui quando vengono rimossi dal blog principale.
         </p>
      </div>
   )

   return (
      <div>
         <div className="mb-5 p-3 bg-base-100 rounded-lg border border-base-300">
            <strong className="text-base-content">🗄️ Archivio ({posts.length})</strong>
            <div className="text-xs text-base-content/70 mt-1">
               📚 Post archiviati e contenuti storici
            </div>
         </div>

         {posts.map((post) => (
            <div
               key={post.key}
               className="max-w-xl break-words border border-dashed border-base-300 my-2.5 p-2.5 text-base-content"
               dangerouslySetInnerHTML={createMarkup(post.content)}
            />
         ))}
      </div>
   )
}

export default ViewArchive
