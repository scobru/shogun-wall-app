import React, { useState, useMemo } from 'react'
import { DungeonNode } from '../Nodes'
import { parseHashtags } from '../utils/hashtagUtils'

interface PostFilterProps {
   posts: DungeonNode[]
   onFilteredPosts: (posts: DungeonNode[]) => void
}

const PostFilter: React.FC<PostFilterProps> = ({ posts, onFilteredPosts }) => {
   const [searchTerm, setSearchTerm] = useState('')
   const [selectedCategory, setSelectedCategory] = useState('')
   const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])

   // Estrai tutte le categorie e hashtag disponibili
   const { allCategories, allHashtags } = useMemo(() => {
      const categories = new Set<string>()
      const hashtags = new Set<string>()
      
      console.log('🔍 PostFilter Debug - Posts analizzati:', posts.length)
      
      posts.forEach((post, index) => {
         console.log(`📝 Post ${index + 1}:`, {
            key: post.key,
            title: post.title,
            category: post.category,
            hashtags: post.hashtags,
            content: post.content?.substring(0, 50) + '...'
         })
         
         if (post.category) {
            categories.add(post.category)
         }
         if (post.hashtags) {
            parseHashtags(post.hashtags).forEach(tag => {
               const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag
               hashtags.add(cleanTag)
            })
         }
      })
      
      console.log('📂 Categorie trovate:', Array.from(categories))
      console.log('🏷️ Hashtags trovati:', Array.from(hashtags))
      
      return {
         allCategories: Array.from(categories).sort(),
         allHashtags: Array.from(hashtags).sort()
      }
   }, [posts])

   // Filtra i post in base ai criteri selezionati
   const filteredPosts = useMemo(() => {
      let result = posts
      
      // Filtra per termine di ricerca (nel titolo e contenuto)
      if (searchTerm.trim()) {
         const term = searchTerm.toLowerCase()
         result = result.filter(post => 
            (post.title && post.title.toLowerCase().includes(term)) ||
            (post.content && post.content.toLowerCase().includes(term)) ||
            (post.category && post.category.toLowerCase().includes(term))
         )
      }
      
      // Filtra per categoria
      if (selectedCategory) {
         result = result.filter(post => post.category === selectedCategory)
      }
      
      // Filtra per hashtags
      if (selectedHashtags.length > 0) {
         result = result.filter(post => {
            if (!post.hashtags) return false
            
            const postHashtags = parseHashtags(post.hashtags)
            return selectedHashtags.some(selectedTag => 
               postHashtags.some(postTag => {
                  const cleanPostTag = postTag.startsWith('#') ? postTag.slice(1) : postTag
                  return cleanPostTag.toLowerCase() === selectedTag.toLowerCase()
               })
            )
         })
      }
      
      return result
   }, [posts, searchTerm, selectedCategory, selectedHashtags])

   // Aggiorna i post filtrati quando cambia il risultato
   React.useEffect(() => {
      onFilteredPosts(filteredPosts)
   }, [filteredPosts, onFilteredPosts])

   const handleCategoryClick = (category: string) => {
      setSelectedCategory(prev => prev === category ? '' : category)
   }

   const handleHashtagClick = (hashtag: string) => {
      setSelectedHashtags(prev => 
         prev.includes(hashtag) 
            ? prev.filter(h => h !== hashtag)
            : [...prev, hashtag]
      )
   }

   const clearAllFilters = () => {
      setSearchTerm('')
      setSelectedCategory('')
      setSelectedHashtags([])
   }

   const hasActiveFilters = searchTerm || selectedCategory || selectedHashtags.length > 0

   console.log('🎯 PostFilter Render - Categories:', allCategories.length, 'Hashtags:', allHashtags.length)

   return (
      <div className="w-full mb-5 p-4 bg-base-100 border border-base-300 rounded-lg">
         {/* Debug info e help */}
         <div className="text-xs text-base-content/70 mb-3 p-2 bg-base-200 rounded border border-base-300">
            <div className="mb-1">
               🐛 <strong>Debug:</strong> {posts.length} posts analizzati, {allCategories.length} categorie, {allHashtags.length} hashtag trovati
            </div>
            <div className="text-[10px] italic">
               💡 <strong>Per testare:</strong> Crea un nuovo post con categoria e hashtag dal menu "New"
            </div>
         </div>
         
         {/* Ricerca testuale */}
         <div className="filter-section mb-3">
            <div className="text-sm font-semibold text-base-content mb-2">Cerca nei post</div>
            <input
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Cerca per titolo, contenuto o categoria..."
               className="input input-bordered w-full text-sm"
            />
         </div>

         {/* Filtro per categoria */}
         {allCategories.length > 0 && (
            <div className="filter-section mb-3">
               <div className="text-sm font-semibold text-base-content mb-2">
                  Categorie ({allCategories.length})
               </div>
               <div className="flex flex-wrap gap-1.5">
                  {allCategories.map(category => (
                     <span
                        key={category}
                        className={`badge cursor-pointer transition-colors ${
                           selectedCategory === category 
                              ? 'badge-error text-white' 
                              : 'badge-outline hover:badge-neutral'
                        }`}
                        onClick={() => handleCategoryClick(category)}
                     >
                        {category}
                     </span>
                  ))}
               </div>
            </div>
         )}

         {/* Hashtags */}
         <div className="filter-section mb-3">
            <div className="text-sm font-semibold text-base-content mb-2">
               Hashtags ({allHashtags.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
               {allHashtags.length > 0 ? (
                  allHashtags.map(hashtag => (
                     <span
                        key={hashtag}
                        className={`badge cursor-pointer transition-colors ${
                           selectedHashtags.includes(hashtag) 
                              ? 'badge-primary text-white' 
                              : 'badge-outline hover:badge-neutral'
                        }`}
                        onClick={() => handleHashtagClick(hashtag)}
                     >
                        #{hashtag}
                     </span>
                  ))
               ) : (
                  <div className="text-xs text-base-content/60 italic p-1">
                     Nessun hashtag disponibile. Aggiungi hashtag ai tuoi post per organizzarli!
                  </div>
               )}
            </div>
         </div>

         {/* Bottone per cancellare filtri */}
         {hasActiveFilters && (
            <button 
               className="btn btn-outline btn-sm mt-2" 
               onClick={clearAllFilters}
            >
               Cancella tutti i filtri
            </button>
         )}

         {/* Info sui risultati */}
         <div className="text-xs text-base-content/60 mt-3">
            {hasActiveFilters ? (
               <>Trovati {filteredPosts.length} post su {posts.length} totali</>
            ) : (
               <>Visualizzando tutti i {posts.length} post</>
            )}
         </div>
      </div>
   )
}

export default PostFilter 