import { useState, useEffect } from 'react'
import { testGunConnection, ConnectionTestResult } from '../utils/gunConnectionTest'

interface GunDiagnosticsProps {
  onRetry?: () => void
}

const GunDiagnostics: React.FC<GunDiagnosticsProps> = ({ onRetry }) => {
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult | null>(null)
  const [testing, setTesting] = useState(false)

  const runTest = async () => {
    setTesting(true)
    try {
      const result = await testGunConnection()
      setConnectionTest(result)
    } catch (error) {
      setConnectionTest({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  const handleRetry = () => {
    runTest()
    onRetry?.()
  }

  return (
    <div className="card bg-base-100 border border-base-300 p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🔧 Diagnostica Gun.js
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium">Stato connessione:</span>
          <span className={`badge ${connectionTest?.isConnected ? 'badge-success' : 'badge-error'}`}>
            {testing ? 'Testing...' : connectionTest?.isConnected ? 'Connesso ✓' : 'Disconnesso ✗'}
          </span>
        </div>
        
        {connectionTest?.latency && (
          <div className="flex justify-between items-center">
            <span className="font-medium">Latenza:</span>
            <span className="text-sm">{connectionTest.latency}ms</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Server:</span>
          <span className="text-sm font-mono">localhost:8765</span>
        </div>
        
        {connectionTest?.error && (
          <div className="alert alert-error">
            <div>
              <div className="font-semibold">Errore:</div>
              <div className="text-sm">{connectionTest.error}</div>
            </div>
          </div>
        )}
        
        {!connectionTest?.isConnected && (
          <div className="bg-base-200 p-3 rounded-lg text-sm">
            <p className="font-semibold mb-2">Possibili soluzioni:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Avvia il server Gun.js</li>
              <li>Verifica che la porta 8765 sia libera</li>
              <li>Controlla la connessione di rete</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-6">
        <button 
          className="btn btn-primary btn-sm flex-1"
          onClick={handleRetry}
          disabled={testing}
        >
          {testing ? 'Testing...' : '🔄 Riprova'}
        </button>
        
        <button 
          className="btn btn-outline btn-sm"
          onClick={() => window.open('http://localhost:8765', '_blank')}
        >
          🌐 Apri Server
        </button>
      </div>
    </div>
  )
}

export default GunDiagnostics 