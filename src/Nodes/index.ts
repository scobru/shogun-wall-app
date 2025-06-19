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
}
