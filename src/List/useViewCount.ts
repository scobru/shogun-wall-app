import { useEffect, useRef, useState } from 'react'
import gun, { namespace } from '../api/gun'
import { random } from 'lodash'

export default function useViewCount(nodeId) {
   const [views, setViews] = useState(1)
   const [intervalLength] = useState(random(2500, 10000))
   const lastUpdateSent = useRef(new Date())

   useEffect(() => {
      const endListener = onViews((newViews: any) => {
         if (newViews < views) return
         if (!newViews) return
         setViews(newViews)
      })

      return () => {
         endListener()
      }
   }, [nodeId, intervalLength])

   useEffect(() => {
      const intervalId = setInterval(() => {
         const newLastUpdateSent = new Date()
         const newViewTime =
            newLastUpdateSent.getTime() - lastUpdateSent.current.getTime()
         const newViewCount = views + newViewTime
         sendViewsRequest(nodeId, newViewCount)
         setViews(newViewCount)
         lastUpdateSent.current = newLastUpdateSent
      }, intervalLength)

      return () => clearInterval(intervalId)
   }, [nodeId, views, intervalLength])

   const sendViewsRequest = (nodeId, views: number) => {
      if (typeof views === 'undefined') return
      if (!nodeId || nodeId === '') {
         console.warn('0 length key!', 'Cannot send views request for empty nodeId')
         return
      }
      return gun
         .get(namespace + '/views')
         .get(nodeId)
         .put(views, (awk) => {
            console.log(`updated viewTime: `, awk)
         })
   }

   const onViews = (callback) => {
      if (!nodeId || nodeId === '') {
         console.warn('0 length key!', 'Cannot listen to views for empty nodeId')
         return () => {}
      }
      return gun
         .get(namespace + '/views')
         .get(nodeId)
         .on((data) => {
            callback(data)
         }).off
   }

   return [views]
}
