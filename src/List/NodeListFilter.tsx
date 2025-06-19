import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { DungeonNode } from '../Nodes'
import { parseHashtags, formatHashtagForDisplay } from '../utils/hashtagUtils'

const FilterContainer = styled.div`
   background-color: var(--card-color);
   border: 1px solid var(--border-color);
   border-radius: 8px;
   padding: 0.75rem;
   margin: 0.75rem 0;
   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
   width: 100%;
   transition: all 0.3s ease;
`

const SearchSection = styled.div<{ $expanded?: boolean }>`
   display: flex;
   gap: 0.5rem;
   align-items: center;
   margin-bottom: ${props => props.$expanded ? '1rem' : '0'};
`

const SearchInput = styled.input`
   flex: 1;
   padding: 0.5rem;
   border: 1px solid var(--border-color);
   border-radius: 4px;
   background-color: var(--card-color);
   color: var(--text-color);
   font-size: 0.875rem;
   box-sizing: border-box;
   
   &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(204, 0, 0, 0.1);
   }
   
   &::placeholder {
      color: var(--text-muted);
   }
`

const ToggleButton = styled.button<{ $expanded?: boolean; $hasFilters?: boolean }>`
   padding: 0.5rem 0.75rem;
   background-color: ${props => props.$hasFilters ? 'var(--color-primary)' : 'transparent'};
   color: ${props => props.$hasFilters ? 'white' : 'var(--text-color)'};
   border: 1px solid ${props => props.$hasFilters ? 'var(--color-primary)' : 'var(--border-color)'};
   border-radius: 4px;
   font-size: 0.75rem;
   cursor: pointer;
   transition: all 0.2s ease;
   white-space: nowrap;
   
   &:hover {
      background-color: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
   }
`

const AdvancedFilters = styled.div<{ $expanded?: boolean }>`
   max-height: ${props => props.$expanded ? '500px' : '0'};
   overflow: hidden;
   transition: max-height 0.3s ease;
`

const FilterSection = styled.div`
   margin-bottom: 1rem;
   
   &:last-child {
      margin-bottom: 0;
   }
`

const FilterLabel = styled.label`
   display: block;
   margin-bottom: 0.5rem;
   font-weight: 600;
   color: var(--text-color);
   font-size: 0.8rem;
`

const FilterTags = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: 0.25rem;
   margin-top: 0.5rem;
`

const FilterTag = styled.button<{ $active?: boolean; $type?: 'category' | 'hashtag' | 'user' }>`
   padding: 0.2rem 0.4rem;
   border: 1px solid ${props => {
      if (props.$type === 'category') return '#dc3545';
      if (props.$type === 'hashtag') return '#6c757d';
      if (props.$type === 'user') return '#007bff';
      return 'var(--border-color)';
   }};
   border-radius: 10px;
   background-color: ${props => props.$active ? (
      props.$type === 'category' ? '#dc3545' :
      props.$type === 'hashtag' ? '#6c757d' :
      props.$type === 'user' ? '#007bff' : 'var(--color-primary)'
   ) : 'transparent'};
   color: ${props => props.$active ? 'white' : (
      props.$type === 'category' ? '#dc3545' :
      props.$type === 'hashtag' ? '#6c757d' :
      props.$type === 'user' ? '#007bff' : 'var(--text-color)'
   )};
   font-size: 0.7rem;
   cursor: pointer;
   transition: all 0.2s ease;
   
   &:hover {
      background-color: ${props => 
         props.$type === 'category' ? '#dc3545' :
         props.$type === 'hashtag' ? '#6c757d' :
         props.$type === 'user' ? '#007bff' : 'var(--color-primary)'
      };
      color: white;
   }
`

const ClearButton = styled.button`
   padding: 0.4rem 0.8rem;
   background-color: var(--color-primary);
   color: white;
   border: none;
   border-radius: 4px;
   font-size: 0.75rem;
   cursor: pointer;
   transition: background-color 0.2s ease;
   
   &:hover {
      background-color: var(--hal-red-dark);
   }
`

const FilterInfo = styled.div`
   font-size: 0.7rem;
   color: var(--text-muted);
   margin-top: 0.5rem;
   font-style: italic;
`

const ResultsInfo = styled.div`
   font-size: 0.75rem;
   color: var(--text-secondary);
   text-align: center;
   margin-top: 0.5rem;
   padding: 0.25rem;
   background-color: var(--gray-50);
   border-radius: 4px;
`

interface FilterState {
   searchText: string
   selectedCategory: string
   selectedHashtags: string[]
   selectedUser: string
}

interface NodeListFilterProps {
   nodes: DungeonNode[]
   onFilteredNodesChange: (filteredNodes: DungeonNode[]) => void
}

const NodeListFilter: React.FC<NodeListFilterProps> = ({ nodes, onFilteredNodesChange }) => {
   const [filters, setFilters] = useState<FilterState>({
      searchText: '',
      selectedCategory: '',
      selectedHashtags: [],
      selectedUser: ''
   })
   const [expanded, setExpanded] = useState(false)

   // Extract unique categories, hashtags, and users from nodes
   const { categories, hashtags, users } = useMemo(() => {
      const categoriesSet = new Set<string>()
      const hashtagsSet = new Set<string>()
      const usersSet = new Set<string>()

      nodes.forEach(node => {
         // Categories
         if (node.category && typeof node.category === 'string' && node.category.trim()) {
            categoriesSet.add(node.category.trim())
         }

         // Hashtags
         if (node.hashtags) {
            const nodeHashtags = parseHashtags(node.hashtags)
            nodeHashtags.forEach(tag => {
               if (tag.trim()) {
                  hashtagsSet.add(tag.trim())
               }
            })
         }

         // Users
         if (node.user && typeof node.user === 'string' && node.user.trim()) {
            usersSet.add(node.user.trim())
         }
      })

      return {
         categories: Array.from(categoriesSet).sort(),
         hashtags: Array.from(hashtagsSet).sort(),
         users: Array.from(usersSet).sort()
      }
   }, [nodes])

   // Filter nodes based on current filters
   const filteredNodes = useMemo(() => {
      return nodes.filter(node => {
         // Text search - cerca in titolo, messaggio, categoria e user
         if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase()
            const matchesText = 
               (node.directionText && node.directionText.toLowerCase().includes(searchLower)) ||
               (node.message && node.message.toLowerCase().includes(searchLower)) ||
               (node.category && node.category.toLowerCase().includes(searchLower)) ||
               (node.user && node.user.toLowerCase().includes(searchLower))
            
            if (!matchesText) return false
         }

         // Category filter
         if (filters.selectedCategory && node.category !== filters.selectedCategory) {
            return false
         }

         // Hashtag filter
         if (filters.selectedHashtags.length > 0) {
            const nodeHashtags = node.hashtags ? parseHashtags(node.hashtags) : []
            const hasSelectedHashtag = filters.selectedHashtags.some(selectedTag => 
               nodeHashtags.some(nodeTag => nodeTag.toLowerCase() === selectedTag.toLowerCase())
            )
            if (!hasSelectedHashtag) return false
         }

         // User filter
         if (filters.selectedUser && node.user !== filters.selectedUser) {
            return false
         }

         return true
      })
   }, [nodes, filters])

   // Update parent component when filtered nodes change
   useEffect(() => {
      onFilteredNodesChange(filteredNodes)
   }, [filteredNodes, onFilteredNodesChange])

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters(prev => ({ ...prev, searchText: e.target.value }))
   }

   const handleCategoryClick = (category: string) => {
      setFilters(prev => ({ 
         ...prev, 
         selectedCategory: prev.selectedCategory === category ? '' : category 
      }))
   }

   const handleHashtagClick = (hashtag: string) => {
      setFilters(prev => ({
         ...prev,
         selectedHashtags: prev.selectedHashtags.includes(hashtag)
            ? prev.selectedHashtags.filter(tag => tag !== hashtag)
            : [...prev.selectedHashtags, hashtag]
      }))
   }

   const handleUserClick = (user: string) => {
      setFilters(prev => ({ 
         ...prev, 
         selectedUser: prev.selectedUser === user ? '' : user 
      }))
   }

   const clearAllFilters = () => {
      setFilters({
         searchText: '',
         selectedCategory: '',
         selectedHashtags: [],
         selectedUser: ''
      })
   }

   const hasActiveFilters = Boolean(
      filters.selectedCategory || 
      filters.selectedHashtags.length > 0 || 
      filters.selectedUser
   )

   const totalFiltersCount = 
      (filters.selectedCategory ? 1 : 0) +
      filters.selectedHashtags.length +
      (filters.selectedUser ? 1 : 0)

   const toggleExpanded = () => {
      setExpanded(!expanded)
   }

   return (
      <FilterContainer>
         <SearchSection $expanded={expanded}>
            <SearchInput
               type="text"
               placeholder="🔍 Cerca nei nodi..."
               value={filters.searchText}
               onChange={handleSearchChange}
            />
            <ToggleButton 
               $expanded={expanded}
               $hasFilters={hasActiveFilters}
               onClick={toggleExpanded}
            >
               {expanded ? '🔼' : '🔽'} Filtri{totalFiltersCount > 0 ? ` (${totalFiltersCount})` : ''}
            </ToggleButton>
         </SearchSection>

         <AdvancedFilters $expanded={expanded}>
            {/* Categories */}
            <FilterSection>
               <FilterLabel>📁 Categorie ({categories.length})</FilterLabel>
               {categories.length > 0 ? (
                  <FilterTags>
                     {categories.map(category => (
                        <FilterTag
                           key={category}
                           $type="category"
                           $active={filters.selectedCategory === category}
                           onClick={() => handleCategoryClick(category)}
                        >
                           {category}
                        </FilterTag>
                     ))}
                  </FilterTags>
               ) : (
                  <FilterInfo>
                     Nessuna categoria disponibile.
                  </FilterInfo>
               )}
            </FilterSection>

            {/* Hashtags */}
            <FilterSection>
               <FilterLabel># Hashtag ({hashtags.length})</FilterLabel>
               {hashtags.length > 0 ? (
                  <FilterTags>
                     {hashtags.map(hashtag => (
                        <FilterTag
                           key={hashtag}
                           $type="hashtag"
                           $active={filters.selectedHashtags.includes(hashtag)}
                           onClick={() => handleHashtagClick(hashtag)}
                        >
                           {formatHashtagForDisplay(hashtag)}
                        </FilterTag>
                     ))}
                  </FilterTags>
               ) : (
                  <FilterInfo>
                     Nessun hashtag disponibile.
                  </FilterInfo>
               )}
            </FilterSection>

            {/* Users */}
            <FilterSection>
               <FilterLabel>👤 Utenti ({users.length})</FilterLabel>
               {users.length > 0 ? (
                  <FilterTags>
                     {users.map(user => (
                        <FilterTag
                           key={user}
                           $type="user"
                           $active={filters.selectedUser === user}
                           onClick={() => handleUserClick(user)}
                        >
                           @{user}
                        </FilterTag>
                     ))}
                  </FilterTags>
               ) : (
                  <FilterInfo>
                     Nessun utente disponibile.
                  </FilterInfo>
               )}
            </FilterSection>

            {/* Clear filters */}
            {hasActiveFilters && (
               <FilterSection>
                  <ClearButton onClick={clearAllFilters}>
                     🗑️ Cancella filtri
                  </ClearButton>
               </FilterSection>
            )}
         </AdvancedFilters>

         {/* Results info - always visible when filtering */}
         {(filters.searchText || hasActiveFilters) && (
            <ResultsInfo>
               Risultati: {filteredNodes.length} su {nodes.length} nodi
            </ResultsInfo>
         )}
      </FilterContainer>
   )
}

export default NodeListFilter
