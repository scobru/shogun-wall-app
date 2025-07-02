import { useEffect, useReducer, useState } from 'react'
import { TopBar } from '../Blog'
import gun, { namespace } from 'api/gun'
import { DungeonNode } from 'Nodes'
import styled from 'styled-components'
import { ViewNode } from './ViewNode'
import LoadingWheel from 'Interface/LoadingWheel'
import moment from 'moment'
import { isNull, isString, random } from 'lodash'
import { TimeAgo } from './TimeAgo'
import delay from './delay'
import NodeListFilter from './NodeListFilter'

const GetAllStyled = styled.div`
   .loadingwheel {
      margin: 0 auto;
      padding-top: 42px;
   }
   
   @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
   }
   
   /* Responsive improvements */
   @media only screen and (max-width: 768px) {
      .sorting-controls {
         flex-direction: column;
         gap: 8px !important;
         align-items: stretch !important;
      }
      
      .sorting-buttons {
         justify-content: center;
      }
      
      .content-info {
         text-align: center !important;
         order: -1;
      }
      
      .manual-button-container {
         justify-content: center !important;
      }
      
      .manual-button {
         max-width: none !important;
         width: 100%;
         max-width: 250px;
      }
   }
   
   @media only screen and (max-width: 480px) {
      .sorting-buttons button {
         min-width: 28px !important;
         padding: 5px 8px !important;
         font-size: 11px !important;
      }
      
      .manual-button {
         font-size: 11px !important;
         padding: 7px 14px !important;
      }
   }
`
const ListNodesWrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   .SearchHighlights {
      height: 42/2;
      margin: 1rem 0rem 0rem 0rem;
      width: 100%;
      .timeAgo {
         display: inline-flex;
      }
      .showMore {
         cursor: pointer;
      }
   }
`
const ListNodes = styled.div`
   display: flex;
   flex-direction: column;
   width: 90%;
   margin: 0 auto;
   @media only screen and (min-width: 600px) {
      width: 520px;
   }
`
const NoContent = styled.div`
   margin: 0 auto;
   text-align: center;
   height: 100%;
   font-size: 22px;
   padding: 0 17px;
   padding-top: 42px;
   max-width: 320px;
`

type SearchState = {
   ticks: number
   lastUpdated: Date
   firstFetched: Date
}
enum SearchActions {
   INCREMENT_TICKS = 'INCREMENT_TICKS',
}
type Action = { type: SearchActions; payload?: any | SearchState['ticks'] }

/**
 * Our reducer for the search state. It will tell us the last
 * time a search was performed, when the first search was
 * performed (this value will not change), and how many
 * times a search result was updated via the DHT service.
 * @param state
 * @param action
 * @returns newState
 */
function searchStateReducer(state: SearchState, { type, payload }: Action) {
   switch (type) {
      case SearchActions.INCREMENT_TICKS:
         return { ...state, ticks: state.ticks + 1, lastUpdated: new Date() }
      default:
         return state
   }
}

/**
 * Renders the current state of the search parameters.
 * @param searchState
 * @returns
 */
const SearchHighlights = ({
   numNodes,
   ticks,
   lastUpdated,
   firstFetched,
}: { numNodes: number } & SearchState) => {
   const [showMore, setShowMore] = useState(false)

   useEffect(() => {
      const intervalId = setInterval(() => {
         setShowMore(false)
      }, 9 * 1000)

      return () => clearInterval(intervalId)
   }, [])

   const showMoreClicked = (event) => {
      event.preventDefault()
      setShowMore(true)
      setTimeout(() => {
         setShowMore(false)
      }, 9 * 1000)
   }

   return (
      <div className="SearchHighlights">
         {numNodes && <>found {numNodes}</>}
         {showMore && (
            <>
               {' '}
               in {ticks} ticks :: updated{' '}
               <TimeAgo date={lastUpdated.getTime()} />
               {lastUpdated.getTime() - firstFetched.getTime() > 60 * 1000 && (
                  <span>
                     :: first fetch: <TimeAgo date={firstFetched.getTime()} />
                  </span>
               )}
            </>
         )}
         {!showMore && (
            <>
               {' '}
               <a className="showMore" onClick={showMoreClicked}>
                  -{'>'}
               </a>
            </>
         )}
      </div>
   )
}

const GetAll = () => {
   const [nodes, setNodes] = useState<DungeonNode[] | any[]>([])
   const [filteredNodes, setFilteredNodes] = useState<DungeonNode[] | any[]>([])
   const [longLoad, setLongLoad] = useState<boolean>(false)
   const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false)
   const [sortMethod, setSortMethod] = useState<'hot' | 'new' | 'top'>('hot')
   const [searchState, dispatch] = useReducer(searchStateReducer, {
      ticks: 0,
      lastUpdated: new Date(),
      firstFetched: new Date(),
   })
   const onNodeRemoved = (nodeKey: string | undefined) => {
      setNodes((nodes) => nodes.filter((node) => node.key !== nodeKey))
   }

   const getNodes = (): Promise<DungeonNode[]> => {
      return new Promise((resolve) => {
         setNodes((nodes) => {
            resolve(nodes)
            return nodes
         })
      })
   }

   // init the page title
   useEffect(() => {
      document.title = `
         HAL 9000 - System Interface
      `
   }, [])

   // Wait 3 seconds and if there still aren't any nodes
   // update the component state to show the 404-ish state
   useEffect(() => {
      setTimeout(() => {
         setNodes((nodes: any) => {
            if (!nodes || !nodes.length) {
               setLongLoad(true)
            }
            return nodes
         })
      }, random(5000, 600000))
   }, [])

   // Sposta fillWithFun fuori dall'useEffect per renderla accessibile
   const fillWithFun = async () => {
      setIsLoadingContent(true)
      try {
         // Platform type definitions
      type RedditPost = {
            author: string
         distinguished: string
         thumbnail: string
            title: string
         url: string
            selftext: string
         created_utc: Number
      }

      type RedditPostResponse = {
         data: {
            children: [{ data: RedditPost }]
         }
      }

         type HackerNewsItem = {
            id: number
            title: string
            url?: string
            text?: string
            by: string
            time: number
            score: number
         }

         type DevToArticle = {
            id: number
            title: string
            description: string
            url: string
            user: {
               name: string
               username: string
            }
            published_at: string
            tags: string[]
         }

         // Platform fetchers
         const fetchRedditPosts = async (): Promise<any> => {
            const channels = [
            'CrazyIdeas',
            'MorbidReality',
            'TalesFromRetail',
            'AskReddit',
               'todayilearned',
               'mildlyinteresting',
               'Showerthoughts'
            ]
            const channel = channels[random(0, channels.length - 1)]
            
         const res = await fetch(`https://www.reddit.com/r/${channel}/new.json`)
            const { data: { children: redditPosts } } = await res.json() as RedditPostResponse
            const post = redditPosts[random(0, redditPosts?.length - 1)]?.data
            
            const postId = `reddit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            return {
               user: post.author,
               thumbnail: post.thumbnail,
               url: post.url,
               date: Date.now(),
               directionText: post.title,
               message: post.selftext || '[Post senza testo]',
               redditDate: post.created_utc,
               id: postId,
               platform: 'Reddit',
               channel: channel
            }
         }

         const fetchHackerNewsPosts = async (): Promise<any> => {
            // Get top stories
            const topStoriesRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
            const topStories = await topStoriesRes.json()
            const randomStoryId = topStories[random(0, Math.min(30, topStories.length - 1))] // Top 30
            
            // Get story details
            const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${randomStoryId}.json`)
            const story: HackerNewsItem = await storyRes.json()
            
            const postId = `hackernews_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            return {
               user: story.by,
               url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
               date: Date.now(),
               directionText: story.title,
               message: story.text || '[Link esterno - clicca per leggere]',
               hackerNewsDate: story.time,
               id: postId,
               platform: 'Hacker News',
               score: story.score
            }
         }

         const fetchDevToPosts = async (): Promise<any> => {
            const res = await fetch('https://dev.to/api/articles?per_page=20&top=1')
            const articles: DevToArticle[] = await res.json()
            const article = articles[random(0, articles.length - 1)]
            
            const postId = `devto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            return {
               user: article.user.username,
               url: article.url,
            date: Date.now(),
               directionText: article.title,
               message: article.description || '[Articolo su sviluppo - clicca per leggere]',
               devToDate: article.published_at,
               id: postId,
               platform: 'DEV.to',
               tags: article.tags.join(', ')
            }
         }

         // Randomly select a platform to fetch from
         const platforms = [
            { name: 'Reddit', fetcher: fetchRedditPosts, weight: 40 },
            { name: 'Hacker News', fetcher: fetchHackerNewsPosts, weight: 30 },
            { name: 'DEV.to', fetcher: fetchDevToPosts, weight: 20 },
         ]
         
         // Weighted random selection
         const totalWeight = platforms.reduce((sum, p) => sum + p.weight, 0)
         let randomWeight = random(0, totalWeight - 1)
         let selectedPlatform = platforms[0]
         
         for (const platform of platforms) {
            if (randomWeight < platform.weight) {
               selectedPlatform = platform
               break
            }
            randomWeight -= platform.weight
         }
         
         console.log(`🎯 [GetAll] Fetching from: ${selectedPlatform.name}`)
         const post = await selectedPlatform.fetcher()
         
         if (!post) {
            console.log('❌ [GetAll] No post returned, skipping...')
            return
         }
         
         console.log('🔍 [GetAll] Salvando post da', post.platform + ':', {
            postId: post.id,
            user: post.user,
            platform: post.platform,
            directionText: post.directionText,
            messageLength: post.message ? post.message.length : 0,
            url: post.url
         })
         
         gun.get(namespace + `/node`)
            .get(post.id)
            .put(post, (awk) => console.log(`📝 [GetAll] Post da ${post.platform} salvato:`, awk))
            
      } catch (error) {
         console.error('❌ [GetAll] Error fetching platform content:', error)
      } finally {
         setIsLoadingContent(false)
      }
   }

   // Get posts from multiple platforms to populate the feed
   useEffect(() => {
      setTimeout(async () => {
         const nodes = await getNodes()
         if (!nodes?.length) {
            console.log(`we're filled with fun!`)
            return fillWithFun()
         }
         console.log(`we did not fill with fun`)
      }, 3000) // time until we'd like to fill it
   }, [])

   const deleteNode = (key): Promise<void> => {
      return new Promise((resolve) => {
         gun.get(namespace + '/node')
            .get(key)
            .put(null, (awk) => {
               console.log(`deleted ${key} awk:`, awk)
               onNodeRemoved(key)
               resolve()
            })
      })
   }

   // handle Nuclear event codes
   useEffect(() => {
      async function downHandler({ key }): Promise<void> {
         if (key !== 'N') {
            return
         }
         const nodes = await getNodes()
         for (const node of nodes) {
            const isOld = moment(node.date).isBefore(
               moment(new Date()).subtract(3, 'days')
            )
            const isReservedKey = ['wrfrn32', 'clock'].includes(key)
            if (isOld && !isReservedKey) {
               await deleteNode(node.key)
            }
         }
      }
      window.addEventListener('keydown', downHandler)
      return () => {
         window.removeEventListener('keydown', downHandler)
      }
   }, [])

   // get all of the nodes
   useEffect(() => {
      const allNodesQuery = gun
         .get(namespace + '/node')
         .map()
         .on((newNode: DungeonNode | any = {}, key) => {
            console.log('newNode:', newNode)
            const immutableNode =
               typeof newNode === 'object'
                  ? { ...newNode, key }
                  : { message: newNode, key }
            setNodes((nodes) => {
               dispatch({ type: SearchActions.INCREMENT_TICKS })
               const filtered = nodes.filter(
                  // if there's NOT already an item by this key
                  // and the node actually exists
                  // and there is a message
                  (node) => node.key !== key && !!node && isString(node.message)
               )
               // if the new node is null ignore it
               // if the new node's message has nothing on it, ignore it
               if (isNull(immutableNode) || !isString(immutableNode.message) || immutableNode.message.trim() === '') {
                  return filtered
               }
               // Applica il sorting dopo aver aggiunto il nuovo nodo
               const updatedNodes = [...filtered, immutableNode]
               return sortNodes(updatedNodes)
            })
         })
      return () => {
         allNodesQuery.off()
         setNodes([])
      }
   }, [sortMethod]) // Aggiungi sortMethod come dipendenza

   // Riordina i nodi quando cambia il metodo di sorting
   useEffect(() => {
      setNodes(currentNodes => sortNodes(currentNodes))
   }, [sortMethod])

   // Algoritmo di scoring per il sorting intelligente
   const calculateHotScore = (node: DungeonNode): number => {
      const upvotes = Number(node.upVotes) || 0
      const downvotes = Number(node.downVotes) || 0
      const score = upvotes - downvotes
      
      // Calcola l'età del post in ore
      const now = Date.now()
      const postTime = Number(node.date) || now
      const ageInHours = (now - postTime) / (1000 * 60 * 60)
      
      // Algoritmo "Hot" simile a Reddit
      // Score più alto = più upvotes, penalizza contenuti vecchi
      const order = Math.log10(Math.max(Math.abs(score), 1))
      const sign = score > 0 ? 1 : score < 0 ? -1 : 0
      const seconds = (postTime - 1134028003000) / 1000 // Epoch di riferimento
      
      return sign * order + seconds / 45000 - (ageInHours * 0.1)
   }

   const sortNodes = (nodes: DungeonNode[]): DungeonNode[] => {
      const nodesCopy = [...nodes]
      
      switch (sortMethod) {
         case 'hot':
            return nodesCopy.sort((a, b) => calculateHotScore(b) - calculateHotScore(a))
         
         case 'top':
            return nodesCopy.sort((a, b) => {
               const scoreA = (Number(a.upVotes) || 0) - (Number(a.downVotes) || 0)
               const scoreB = (Number(b.upVotes) || 0) - (Number(b.downVotes) || 0)
               if (scoreA !== scoreB) return scoreB - scoreA
               return (Number(b.date) || 0) - (Number(a.date) || 0) // Fallback su data
            })
         
         case 'new':
         default:
            return nodesCopy.sort((a, b) => (Number(b.date) || 0) - (Number(a.date) || 0))
      }
   }

   return (
      <GetAllStyled>
         <TopBar />
         {!nodes.length && !longLoad && (
            <LoadingWheel className="loadingwheel" />
         )}
         {!nodes.length && longLoad && (
            <NoContent>
               It doesn't look like there's anything here... yet
            </NoContent>
         )}
         <ListNodesWrapper>
            <ListNodes>
               {nodes.length > 0 && (
                  <NodeListFilter 
                     nodes={nodes} 
                     onFilteredNodesChange={setFilteredNodes} 
                  />
               )}
               
               {/* Selettore metodo di ordinamento */}
               <div className="sorting-controls" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '12px 0 8px 0',
                  gap: '12px',
                  flexWrap: 'wrap'
               }}>
                  <div className="sorting-buttons" style={{
                     display: 'flex',
                     borderRadius: '6px',
                     padding: '2px',
                     fontSize: '12px'
                  }}>
                     {[
                        { key: 'hot', label: '🔥', desc: 'Algoritmo intelligente' },
                        { key: 'top', label: '⭐', desc: 'Più votati' },
                        { key: 'new', label: '🆕', desc: 'Più recenti' }
                     ].map(({ key, label, desc }) => (
                        <button
                           key={key}
                           onClick={() => setSortMethod(key as 'hot' | 'new' | 'top')}
                           style={{
                              background: sortMethod === key 
                                 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                 : 'transparent',
                              color: sortMethod === key ? 'white' : '#666',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '32px'
                           }}
                           title={desc}
                           onMouseEnter={(e) => {
                              if (sortMethod !== key) {
                                 e.currentTarget.style.background = '#e9ecef'
                                 e.currentTarget.style.color = '#333'
                              }
                           }}
                           onMouseLeave={(e) => {
                              if (sortMethod !== key) {
                                 e.currentTarget.style.background = 'transparent'
                                 e.currentTarget.style.color = '#666'
                              }
                           }}
                        >
                           {label}
                        </button>
                     ))}
                  </div>
                  
                  <div className="content-info" style={{
                     fontSize: '10px',
                     color: '#888',
                     fontStyle: 'italic',
                     flex: '1',
                     textAlign: 'center',
                     minWidth: '120px'
                  }}>
                     {sortMethod === 'hot' && 'Contenuti trending'}
                     {sortMethod === 'top' && 'Ordinati per voti'}
                     {sortMethod === 'new' && 'Ordinati per data'}
                  </div>

                  <div style={{
                     fontSize: '10px',
                     color: '#666',
                     fontWeight: '500'
                  }}>
                     {nodes.length === 0 ? 'Nessun contenuto' : `${nodes.length} contenuti`}
                  </div>
               </div>
               
               {/* Pulsante per caricare contenuti manualmente */}
               <div className="manual-button-container" style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  margin: '8px 0 16px 0'
               }}>
                  <button
                     className="manual-button"
                     onClick={fillWithFun}
                     disabled={isLoadingContent}
                     style={{
                        background: isLoadingContent 
                           ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                           : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: isLoadingContent ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        transform: 'translateY(0)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        maxWidth: '200px'
                     }}
                     onMouseEnter={(e) => {
                        if (!isLoadingContent) {
                           e.currentTarget.style.transform = 'translateY(-1px)'
                           e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)'
                        }
                     }}
                     onMouseLeave={(e) => {
                        if (!isLoadingContent) {
                           e.currentTarget.style.transform = 'translateY(0)'
                           e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)'
                        }
                     }}
                  >
                     {isLoadingContent ? (
                        <>
                           <div style={{
                              width: '14px',
                              height: '14px',
                              border: '2px solid transparent',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                           }} />
                           Caricamento...
                        </>
                     ) : (
                        <>
                           🎲 Carica Contenuto
                        </>
                     )}
                  </button>
               </div>
               
               {nodes.length && (
                  <SearchHighlights {...searchState} numNodes={filteredNodes.length || nodes.length} />
               )}
               {(filteredNodes.length > 0 ? filteredNodes : nodes).map((node) => (
                  <ViewNode
                     node={node}
                     key={node.key}
                     onNodeRemoved={onNodeRemoved}
                  />
               ))}
            </ListNodes>
         </ListNodesWrapper>
      </GetAllStyled>
   )
}

export default GetAll
