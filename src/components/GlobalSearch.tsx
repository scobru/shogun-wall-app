import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import gun, { namespace } from '../api/gun';

const SearchContainer = styled.div`
  margin-bottom: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--border-hover);
  }
`;

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
`;

const SearchTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
`;

const ToggleButton = styled.button`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--surface-hover);
    border-color: var(--border-hover);
    color: var(--text-primary);
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const SearchContent = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '600px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const SearchInputContainer = styled.div`
  position: relative;
  margin-bottom: var(--space-3);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-10);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-family: var(--font-sans);
  background: var(--surface);
  color: var(--text-primary);
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;



const SearchResults = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
`;

const SearchResultItem = styled.div`
  padding: var(--space-3);
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: var(--surface-hover);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ResultTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  font-size: 13px;
  font-family: var(--font-sans);
`;

const ResultPreview = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: var(--space-2);
  font-family: var(--font-sans);
`;

const ResultMeta = styled.div`
  display: flex;
  gap: var(--space-2);
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-sans);
`;

const ResultsBadge = styled.span<{ type: 'post' | 'node' }>`
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: 9px;
  font-weight: 600;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => props.type === 'post' ? 'var(--success-500)' : 'var(--primary-500)'};
  color: white;
`;

const EmptyState = styled.div`
  padding: var(--space-5);
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  font-family: var(--font-sans);
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
        <SearchTitle>Ricerca Globale</SearchTitle>
        <ToggleButton onClick={() => setIsOpen(!isOpen)}>
                      {isOpen ? 'Nascondi' : 'Espandi'}
        </ToggleButton>
      </SearchHeader>
      
      <SearchContent isOpen={isOpen}>
        <SearchInputContainer>
          
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
                key={result.id}
                onClick={() => handleResultClick(result)}
              >
                <ResultTitle>{result.title}</ResultTitle>
                <ResultPreview>{stripHtml(result.content)}</ResultPreview>
                <ResultMeta>
                  <ResultsBadge type={result.type}>
                                            {result.type === 'post' ? 'Post' : 'Nodo'}
                  </ResultsBadge>
                                      <span>@{result.author}</span>
                                      {result.date > 0 && <span>{formatDate(result.date)}</span>}
                    {result.hashtags && <span>{result.hashtags}</span>}
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