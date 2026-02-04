import React from 'react'
import ReactDOM from 'react-dom/client'
import WageCalculator from './WageCalculator.jsx'
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WageCalculator />
    <Analytics />
  </React.StrictMode>,
)
