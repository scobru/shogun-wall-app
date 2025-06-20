import gun, { namespace } from '../api/gun'

export interface ConnectionTestResult {
  isConnected: boolean
  latency?: number
  error?: string
  serverInfo?: any
}

export const testGunConnection = (): Promise<ConnectionTestResult> => {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const testKey = `connection_test_${startTime}`
    const timeout = setTimeout(() => {
      resolve({
        isConnected: false,
        error: 'Connection timeout after 3 seconds'
      })
    }, 3000)

    gun.get(`${namespace}/connection_test`).put({ 
      test: testKey, 
      timestamp: startTime 
    }, (ack: any) => {
      clearTimeout(timeout)
      const latency = Date.now() - startTime
      
      if (ack.err) {
        resolve({
          isConnected: false,
          latency,
          error: ack.err
        })
      } else {
        resolve({
          isConnected: true,
          latency,
          serverInfo: ack
        })
      }
    })
  })
}

export const getGunStatus = async (): Promise<{
  connection: ConnectionTestResult
  peers: string[]
  namespace: string
}> => {
  const connection = await testGunConnection()
  
  return {
    connection,
    peers: ['http://localhost:8765/gun'], // From gun.ts config
    namespace
  }
}

// Auto-test connection on import in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    const status = await getGunStatus()
    console.log('🔧 Gun.js Status:', status)
  }, 1000)
} 