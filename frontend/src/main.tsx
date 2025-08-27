import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardPage } from '@/pages/dashboard'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Add more routes here */}
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
)
