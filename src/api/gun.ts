import { ShogunCore, Gun, SEA } from 'shogun-core'
import { setToken, getToken } from './gun-put-headers' // Importa SEA per funzionalità di signature e crittografia

const peers = ['wss://ruling-mastodon-improved.ngrok-free.app/gun','wss://peer.wallie.io/gun','wss://gun-manhattan.herokuapp.com/gun']

// if (window.location.hostname === 'localhost') {
//    peers.push('http://192.168.1.7:8765/gun')
// }


setToken('S3RVER')
getToken()

const shogunCore = new ShogunCore({
   scope: 'hal9000',
   peers,
})

const gun = shogunCore.gun


// const gun = Gun({
//    peers,
// })

export default gun

const queryString = window.location.search

const urlParams = new URLSearchParams(queryString)
const split = window.location.host.split('.')
const subDomain = split.length > 2 ? split[0] : 'shogun/hal9000'

export const defaultNamespace = urlParams.get('namespace') || subDomain
export let namespace: string = defaultNamespace

export const setNamespace = (newValue: string | undefined): void => {
   if (!newValue) {
      namespace = defaultNamespace
      return
   }
   namespace = newValue as string
}

// every 15 minutes send an update to make sure we're still connected
setInterval(
   () => {
      gun.get(`${namespace}/heartbeat`).put(
         { time: new Date().getTime() },
         (awk) => {
            console.log(awk)
            console.log(`heartbeat performed`)
         }
      )
   },
   10 * 60 * 1000
)
