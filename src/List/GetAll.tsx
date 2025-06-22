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

   // Get posts from multiple platforms to populate the feed
   useEffect(() => {
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

    

      const fillWithFun = async () => {
         try {
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
         }
      }
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
               return [...filtered, immutableNode].sort(
                  (node, nodeB) => nodeB.date - node.date
               )
            })
         })
      return () => {
         allNodesQuery.off()
         setNodes([])
      }
   }, [])

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
