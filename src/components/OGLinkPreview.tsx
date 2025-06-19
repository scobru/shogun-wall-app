import React, { useState, useEffect } from 'react'
import styled from 'styled-components/macro'

const PreviewContainer = styled.div`
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  overflow: hidden;
  margin: 10px 0;
  max-width: 500px;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`

const CompactPreviewContainer = styled.div`
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  overflow: hidden;
  margin: 6px 0;
  max-width: 400px;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
`

const PreviewImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
`

const CompactPreviewImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  display: block;
  border-radius: 6px;
`

const PreviewContent = styled.div`
  padding: 12px 16px;
`

const CompactPreviewContent = styled.div`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`

const CompactTextContent = styled.div`
  flex: 1;
  min-width: 0; /* Allow text to truncate */
`

const PreviewTitle = styled.h3`
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CompactPreviewTitle = styled.h4`
  margin: 0 0 3px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const PreviewDescription = styled.p`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #657786;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CompactPreviewDescription = styled.p`
  margin: 0;
  font-size: 12px;
  color: #657786;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const PreviewDomain = styled.span`
  font-size: 12px;
  color: #657786;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const CompactPreviewDomain = styled.span`
  font-size: 10px;
  color: #657786;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const PreviewLink = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
  
  &:hover {
    text-decoration: none;
  }
`

const LoadingContainer = styled.div`
  padding: 16px;
  text-align: center;
  color: #657786;
  font-size: 14px;
`

const CompactLoadingContainer = styled.div`
  padding: 8px;
  text-align: center;
  color: #657786;
  font-size: 12px;
`

const ErrorContainer = styled.div`
  padding: 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  margin: 10px 0;
  
  .basic-link {
    color: #1a73e8;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
    
    &:before {
      content: "🔗 ";
      margin-right: 4px;
    }
  }
`

const CompactErrorContainer = styled.div`
  padding: 6px 8px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  margin: 6px 0;
  
  .basic-link {
    color: #1a73e8;
    text-decoration: none;
    font-weight: 500;
    font-size: 12px;
    
    &:hover {
      text-decoration: underline;
    }
    
    &:before {
      content: "🔗 ";
      margin-right: 4px;
    }
  }
`

interface OGData {
  title?: string
  description?: string
  image?: string
  url?: string
  siteName?: string
}

interface OGLinkPreviewProps {
  url: string
  className?: string
  compact?: boolean // New prop for compact mode
}

// Simple cache to avoid refetching the same URLs
const ogCache = new Map<string, OGData | null>()

export const OGLinkPreview: React.FC<OGLinkPreviewProps> = ({ url, className, compact = false }) => {
  const [ogData, setOgData] = useState<OGData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url) return

    console.log('🔗 [OGLinkPreview] Attempting to fetch OG data for:', url)

    // Check cache first
    if (ogCache.has(url)) {
      const cachedData = ogCache.get(url)
      console.log('🔗 [OGLinkPreview] Using cached data:', cachedData)
      setOgData(cachedData || null)
      setError(cachedData === null)
      return
    }

    const fetchOGData = async () => {
      setLoading(true)
      setError(false)
      console.log('🔗 [OGLinkPreview] Starting fetch...')

      try {
        // Use a CORS proxy service to fetch OG metadata
        // Note: In production, you'd want to use your own backend service
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
        console.log('🔗 [OGLinkPreview] Proxy URL:', proxyUrl)
        
        const response = await fetch(proxyUrl)
        const data = await response.json()
        
        console.log('🔗 [OGLinkPreview] API Response:', data)
        
        if (!data.contents) {
          throw new Error('No content received')
        }

        const parser = new DOMParser()
        const doc = parser.parseFromString(data.contents, 'text/html')

        // Extract OG metadata
        const getMetaContent = (property: string): string | undefined => {
          const meta = doc.querySelector(`meta[property="${property}"]`) ||
                      doc.querySelector(`meta[name="${property}"]`)
          return meta?.getAttribute('content') || undefined
        }

        const getMetaContentTwitter = (name: string): string | undefined => {
          const meta = doc.querySelector(`meta[name="twitter:${name}"]`)
          return meta?.getAttribute('content') || undefined
        }

        const extractedData: OGData = {
          title: getMetaContent('og:title') || 
                 getMetaContentTwitter('title') ||
                 doc.querySelector('title')?.textContent ||
                 undefined,
          description: getMetaContent('og:description') || 
                      getMetaContentTwitter('description') ||
                      getMetaContent('description') ||
                      undefined,
          image: getMetaContent('og:image') || 
                 getMetaContentTwitter('image') ||
                 undefined,
          siteName: getMetaContent('og:site_name') || 
                   new URL(url).hostname,
          url: getMetaContent('og:url') || url
        }

        console.log('🔗 [OGLinkPreview] Extracted data:', extractedData)

        // Validate that we have at least a title
        if (!extractedData.title && !extractedData.description) {
          throw new Error('No usable metadata found')
        }

        ogCache.set(url, extractedData)
        setOgData(extractedData)
      } catch (err) {
        console.warn('🔗 [OGLinkPreview] Failed to fetch OG data for:', url, err)
        ogCache.set(url, null)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchOGData()
  }, [url])

  console.log('🔗 [OGLinkPreview] Render state:', { url, loading, error, ogData: !!ogData })

  if (loading) {
    return compact ? (
      <CompactLoadingContainer className={className}>
        Caricamento...
      </CompactLoadingContainer>
    ) : (
      <LoadingContainer className={className}>
        Caricamento anteprima link...
      </LoadingContainer>
    )
  }

  if (error || !ogData) {
    return compact ? (
      <CompactErrorContainer className={className}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="basic-link">
          {new URL(url).hostname}
        </a>
      </CompactErrorContainer>
    ) : (
      <ErrorContainer className={className}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="basic-link">
          {url}
        </a>
      </ErrorContainer>
    )
  }

  const domain = ogData.siteName || new URL(url).hostname

  if (compact) {
    return (
      <CompactPreviewContainer className={className}>
        <PreviewLink href={url} target="_blank" rel="noopener noreferrer">
          <CompactPreviewContent>
            {ogData.image && (
              <CompactPreviewImage 
                src={ogData.image} 
                alt={ogData.title || 'Link preview'}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            )}
            <CompactTextContent>
              {ogData.title && (
                <CompactPreviewTitle>{ogData.title}</CompactPreviewTitle>
              )}
              {ogData.description && (
                <CompactPreviewDescription>{ogData.description}</CompactPreviewDescription>
              )}
              <CompactPreviewDomain>{domain}</CompactPreviewDomain>
            </CompactTextContent>
          </CompactPreviewContent>
        </PreviewLink>
      </CompactPreviewContainer>
    )
  }

  return (
    <PreviewContainer className={className}>
      <PreviewLink href={url} target="_blank" rel="noopener noreferrer">
        {ogData.image && (
          <PreviewImage 
            src={ogData.image} 
            alt={ogData.title || 'Link preview'}
            onError={(e) => {
              // Hide image if it fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        )}
        <PreviewContent>
          {ogData.title && (
            <PreviewTitle>{ogData.title}</PreviewTitle>
          )}
          {ogData.description && (
            <PreviewDescription>{ogData.description}</PreviewDescription>
          )}
          <PreviewDomain>{domain}</PreviewDomain>
        </PreviewContent>
      </PreviewLink>
    </PreviewContainer>
  )
}

export default OGLinkPreview
