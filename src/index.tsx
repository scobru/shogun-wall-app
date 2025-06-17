import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './Router'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import reportWebVitals from './reportWebVitals'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
   <React.StrictMode>
      <Router />
   </React.StrictMode>
)

reportWebVitals()
serviceWorkerRegistration.register()
