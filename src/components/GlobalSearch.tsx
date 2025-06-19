import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import gun, { namespace } from '../api/gun';

const SearchContainer = styled.div`
  margin-bottom: 20px;
  background-color: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
`;

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SearchTitle = styled.div`
  font-weight: 600;
  color: var(--text-color);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleButton = styled.button`
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--background-color);
    border-color: var(--accent-color);
  }
`;

const SearchContent = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '600px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const SearchInputContainer = styled.div`
  position: relative;
  margin-bottom: 12px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 35px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--background-color);
  color: var(--text-color);
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 16px;
  pointer-events: none;
`;

const SearchResults = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--background-color);
`;

const SearchResultItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: var(--card-color);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ResultTitle = styled.div`
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
  font-size: 13px;
`;

const ResultPreview = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 6px;
`;

const ResultMeta = styled.div`
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: var(--text-muted);
`;

const ResultsBadge = styled.span<{ type: 'post' | 'node' }>`
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: bold;
  background: ${props => props.type === 'post' ? '#4CAF50' : '#2196F3'};
  color: white;
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
`;

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'post' | 'node';
  author: string;
  date: number;
  hashtags?: string;
}

interface GlobalSearchProps {
  onResultClick: (result: SearchResult) => void;
  placeholder?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  onResultClick, 
  placeholder = "Cerca per titolo, contenuto, hashtag..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const searchTimeout = setTimeout(() => {
      performSearch(query.trim());
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, isOpen]);

  const performSearch = async (searchQuery: string) => {
    const searchResults: SearchResult[] = [];
    
    try {
      // Search in posts
      await new Promise((resolve) => {
        gun.get(`${namespace}/post`).map().once((data: any, key: string) => {
          if (data && typeof data === 'object') {
            const searchableText = `${data.title || ''} ${data.content || ''} ${data.hashtags || ''}`.toLowerCase();
            
            if (searchableText.includes(searchQuery.toLowerCase())) {
              searchResults.push({
                id: key,
                title: data.title || 'Post senza titolo',
                content: data.content || '',
                type: 'post',
                author: data.user || 'Anonymous',
                date: data.timestamp || data.date || 0,
                hashtags: data.hashtags
              });
            }
          }
        });
        
        setTimeout(resolve, 500);
      });

      // Search in nodes
      await new Promise((resolve) => {
        gun.get(`${namespace}/node`).map().once((data: any, key: string) => {
          if (data && typeof data === 'object') {
            const searchableText = `${data.directionText || ''} ${data.message || ''}`.toLowerCase();
            
            if (searchableText.includes(searchQuery.toLowerCase())) {
              searchResults.push({
                id: key,
                title: data.directionText || 'Nodo senza titolo',
                content: data.message || '',
                type: 'node',
                author: data.user || 'Anonymous',
                date: data.date || 0
              });
            }
          }
        });
        
        setTimeout(resolve, 500);
      });

      // Sort by relevance and date
      const sortedResults = searchResults
        .sort((a, b) => {
          // Prioritize exact matches in title
          const aExactTitle = a.title.toLowerCase().includes(searchQuery.toLowerCase());
          const bExactTitle = b.title.toLowerCase().includes(searchQuery.toLowerCase());
          
          if (aExactTitle && !bExactTitle) return -1;
          if (!aExactTitle && bExactTitle) return 1;
          
          // Then sort by date
          return b.date - a.date;
        })
        .slice(0, 10);

      setResults(sortedResults);
      
    } catch (error) {
      console.error('Errore durante la ricerca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    setQuery('');
    setResults([]);
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 80);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('it-IT', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchTitle>
          🔍 Ricerca Globale
        </SearchTitle>
        <ToggleButton onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '👁️ Nascondi' : '🔎 Espandi'}
        </ToggleButton>
      </SearchHeader>
      
      <SearchContent isOpen={isOpen}>
        <SearchInputContainer>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchInputContainer>
        
        {query.length >= 2 && (
          <SearchResults>
            {isLoading && (
              <EmptyState>
                Ricerca in corso...
              </EmptyState>
            )}
            
            {!isLoading && results.length === 0 && query.length >= 2 && (
              <EmptyState>
                Nessun risultato trovato per "<strong>{query}</strong>"
              </EmptyState>
            )}
            
            {!isLoading && results.map((result) => (
              <SearchResultItem
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
              >
                <ResultTitle>{result.title}</ResultTitle>
                <ResultPreview>{stripHtml(result.content)}</ResultPreview>
                <ResultMeta>
                  <ResultsBadge type={result.type}>
                    {result.type === 'post' ? '📝 Post' : '🔗 Nodo'}
                  </ResultsBadge>
                  <span>👤 {result.author}</span>
                  {result.date > 0 && <span>📅 {formatDate(result.date)}</span>}
                  {result.hashtags && <span>🏷️ {result.hashtags}</span>}
                </ResultMeta>
              </SearchResultItem>
            ))}
          </SearchResults>
        )}
        
        {query.length > 0 && query.length < 2 && (
          <EmptyState>
            Digita almeno 2 caratteri per iniziare la ricerca
          </EmptyState>
        )}
      </SearchContent>
    </SearchContainer>
  );
}; 