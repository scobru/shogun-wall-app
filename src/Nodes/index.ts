export { default as NewNode } from './NewNode'
export { default as NewSubNode } from './NewSubNode'
export { default as ViewNode } from './ViewNode'
export { default as NodeRow } from './NodeRow'
export { default as DashboardItem } from './DashboardItem'
export { default as NodesLanding } from './NodesLanding'

export type GunId = string
export type Username = string
export type Unixtimestamp = number | string

export type Directions = {
   GunId: string
}

export type DungeonNode = {
   key?: GunId
   id: GunId
   head: GunId
   message: string
   url?: string // comes from reddit posts
   date: Unixtimestamp
   user: GunId | Username
   directions: Directions
   directionText: string
   start: string
   end: string
   upVotes: number
   downVotes: number
   content: string // comes from the original node.blog.post type
   title?: string // comes from the node.dashboard type
   createdAt: number
   updatedAt: number
   author: string
   upvotes: number
   downvotes: number
   userVote?: 'up' | 'down' | null
   
   // Nuove proprietà aggiunte per l'autenticazione e metadata
   userPub?: string | null // Public key dell'utente Shogun
   userId?: string | null // ID dell'utente (stesso valore di userPub)
   userType?: 'shogun' | 'guest' | 'legacy' // Tipo di utente
   timestamp?: number // Timestamp di creazione (più preciso di date)
   
   // Proprietà per organizzazione e categorizzazione
   category?: string // Categoria del post/nodo
   hashtags?: string // Hashtags del post/nodo
   description?: string // Descrizione del post (per i blog posts)
   image?: string // URL dell'immagine del post
   
   // Proprietà per multi-platform support
   platform?: string // Piattaforma di origine (Reddit, Hacker News, DEV.to, etc.)
   channel?: string // Canale/subreddit specifico (per Reddit)
   score?: number // Punteggio/score (per Hacker News)
   tags?: string // Tags del post (per DEV.to)
   thumbnail?: string // Thumbnail dell'immagine
   redditDate?: number // Data originale Reddit
   hackerNewsDate?: number // Data originale Hacker News  
   devToDate?: string // Data originale DEV.to
}
