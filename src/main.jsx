import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<App />} />
        <Route path="/uk" element={<App />} />
        <Route path="/uk/*" element={<App />} />
        <Route path="/en-gb" element={<App />} />
        <Route path="/en-gb/*" element={<App />} />
        <Route path="/en-ca" element={<App />} />
        <Route path="/en-ca/*" element={<App />} />
        <Route path="/en-us" element={<App />} />
        <Route path="/en-us/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
