import Gun from 'gun'
import 'gun/sea.js' // Importa SEA per funzionalità di signature e crittografia

const peers = ['https://ruling-mastodon-improved.ngrok-free.app/gun']

if (window.location.hostname === 'localhost') {
   // peers.push('http://192.168.1.7:8765/gun')
   peers.push('https://ruling-mastodon-improved.ngrok-free.app/gun')
}

const gun = Gun({
   localStorage: false,
   radisk:false,
   peers,
   headers:{
      token: "shogun2025",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer shogun2025`
   },
   token: "shogun2025"
})

export default gun

const queryString = window.location.search

const urlParams = new URLSearchParams(queryString)
const split = window.location.host.split('.')
const subDomain = split.length > 2 ? split[0] : 'hal9000'

console.log(subDomain)

export const defaultNamespace =
   urlParams.get('namespace') || subDomain
export let namespace: string = defaultNamespace

export const setNamespace = (newValue: string | undefined): void => {
   if (!newValue) {
      namespace = defaultNamespace
      return
   }
   namespace = newValue as string
}

// every 15 minutes send an update to make sure we're still connected
setInterval(() => {
   gun.get(`${namespace}/heartbeat`).put(
      { time: new Date().getTime() },
      (awk) => {
         console.log(awk)
         console.log(`heartbeat performed`)
      }
   )
}, 10 * 60 * 1000)
