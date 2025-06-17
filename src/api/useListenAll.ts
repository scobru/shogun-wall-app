import { DungeonNode } from 'Nodes'
import { useEffect, useState } from 'react'
import gun, { namespace } from './gun'

const useListenAll = (
   model: string = 'node'
): DungeonNode[] => {
   const [nodes, setNodes] = useState<DungeonNode[]>([])

   const setNodesCallback = (newNode: any = {}, key: string) => {
      console.log(`📥 useListenAll ricevuto:`, { model, key, newNode })
      
      setNodes((prevNodes) => {
         const filteredNodes = prevNodes.filter((node) => node.key !== key)
         if (!newNode || newNode === null) {
            return filteredNodes
         }
         return [...filteredNodes, { ...newNode, key }]
      })
   }

   useEffect(() => {
      console.log(`🔄 useListenAll inizializzazione per model: ${model}`)
      setNodes([])
      
      // Ascolta tutti gli elementi del modello usando .map()
      const chain = gun
         .get(`${namespace}/${model}`)
         .map()
         .on(setNodesCallback)
         
      return () => {
         console.log(`🔄 useListenAll cleanup per model: ${model}`)
         chain.off()
      }
   }, [model])

   console.log(`📊 useListenAll stato attuale:`, { model, nodesCount: nodes.length, nodes })

   return nodes
}

export default useListenAll 