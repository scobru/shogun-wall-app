import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { DungeonNode } from './index'
import { parseHashtags } from '../utils/hashtagUtils'

const FilterStyled = styled.div`
   margin-bottom: 15px;
   padding: 12px;
   background-color: #f8f9fa;
   border: 1px solid #dee2e6;
   border-radius: 6px;
   
   .filter-section {
      margin-bottom: 10px;
      
      &:last-child {
         margin-bottom: 0;
      }
   }
   
   .filter-label {
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
      font-size: 12px;
   }
   
   .search-input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background-color: white;
      color: #333;
      font-size: 12px;
      
      &:focus {
         outline: none;
         border-color: #dc3545;
         box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
      }
      
      &::placeholder {
         color: #6c757d;
      }
   }
   
   .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
   }
   
   .tag {
      padding: 2px 6px;
      border: 1px solid #ced4da;
      border-radius: 10px;
      background-color: white;
      color: #6c757d;
      font-size: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
         background-color: #f8f9fa;
      }
      
      &.active {
         background-color: #dc3545;
         color: white;
         border-color: #dc3545;
      }
      
      &.category {
         font-weight: 600;
         
         &.active {
            background-color: #dc3545;
         }
      }
   }
   
   .clear-filters {
      margin-top: 8px;
      padding: 4px 8px;
      background: transparent;
      border: 1px solid #ced4da;
      border-radius: 3px;
      color: #6c757d;
      font-size: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
         background-color: #f8f9fa;
         border-color: #6c757d;
      }
   }
   
   .results-info {
      margin-top: 8px;
      font-size: 11px;
      color: #6c757d;
   }
`

interface NodeFilterProps {
   nodes: DungeonNode[]
   onFilteredNodes: (nodes: DungeonNode[]) => void
}

const NodeFilter: React.FC<NodeFilterProps> = ({ nodes, onFilteredNodes }) => {
   const [searchTerm, setSearchTerm] = useState('')
   const [selectedCategory, setSelectedCategory] = useState('')
   const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])

   const { allCategories, allHashtags } = useMemo(() => {
      const categories = new Set<string>()
      const hashtags = new Set<string>()
      
      nodes.forEach((node) => {
         if (node.category) {
            categories.add(node.category)
         }
         if (node.hashtags) {
            parseHashtags(node.hashtags).forEach(tag => {
               const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag
               hashtags.add(cleanTag)
            })
         }
      })
      
      return {
         allCategories: Array.from(categories).sort(),
         allHashtags: Array.from(hashtags).sort()
      }
   }, [nodes])

   const filteredNodes = useMemo(() => {
      let result = nodes
      
      if (searchTerm.trim()) {
         const term = searchTerm.toLowerCase()
         result = result.filter(node => 
            (node.directionText && node.directionText.toLowerCase().includes(term)) ||
            (node.message && node.message.toLowerCase().includes(term)) ||
            (node.category && node.category.toLowerCase().includes(term))
         )
      }
      
      if (selectedCategory) {
         result = result.filter(node => node.category === selectedCategory)
      }
      
      if (selectedHashtags.length > 0) {
         result = result.filter(node => {
            if (!node.hashtags) return false
            
            const nodeHashtags = parseHashtags(node.hashtags)
            return selectedHashtags.some(selectedTag => 
               nodeHashtags.some(nodeTag => {
                  const cleanNodeTag = nodeTag.startsWith('#') ? nodeTag.slice(1) : nodeTag
                  return cleanNodeTag.toLowerCase() === selectedTag.toLowerCase()
               })
            )
         })
      }
      
      return result
   }, [nodes, searchTerm, selectedCategory, selectedHashtags])

   React.useEffect(() => {
      onFilteredNodes(filteredNodes)
   }, [filteredNodes, onFilteredNodes])

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

   const hasActiveFilters = searchTerm.trim() || selectedCategory || selectedHashtags.length > 0

   return (
      <FilterStyled>
         <div className="filter-section">
            <div className="filter-label">🔍 Cerca nei nodi</div>
            <input
               type="text"
               className="search-input"
               placeholder="Cerca per titolo, messaggio o categoria..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         
         {allCategories.length > 0 && (
            <div className="filter-section">
               <div className="filter-label">📂 Categorie ({allCategories.length})</div>
               <div className="tags-container">
                  {allCategories.map(category => (
                     <span
                        key={category}
                        className={`tag category ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(category)}
                     >
                        {category}
                     </span>
                  ))}
               </div>
            </div>
         )}
         
         {allHashtags.length > 0 && (
            <div className="filter-section">
               <div className="filter-label"># Hashtags ({allHashtags.length})</div>
               <div className="tags-container">
                  {allHashtags.map(hashtag => (
                     <span
                        key={hashtag}
                        className={`tag ${selectedHashtags.includes(hashtag) ? 'active' : ''}`}
                        onClick={() => handleHashtagClick(hashtag)}
                     >
                        #{hashtag}
                     </span>
                  ))}
               </div>
            </div>
         )}
         
         {hasActiveFilters && (
            <button className="clear-filters" onClick={clearAllFilters}>
               ✕ Pulisci filtri
            </button>
         )}
         
         <div className="results-info">
            Visualizzando tutti i {filteredNodes.length} nodi
         </div>
      </FilterStyled>
   )
}

export default NodeFilter
