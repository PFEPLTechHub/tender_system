import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import { ToastProvider } from './components/ToastContainer'
import Login from './screens/Login'
import Combined from './screens/Combined'
import Form from './screens/project/Form'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Combined />} />
          <Route path="/forms/:id" element={<Form />} />
        </Routes>
        <Analytics />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
)
