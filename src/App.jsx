import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Loginpage from "./loginpage"
import Dashboard from "./dashboard"
import { useState } from 'react'
import './App.css';

function App() {



  return (
    <>
      <BrowserRouter>
        <>
          <Routes>
            <Route index element={<Loginpage />} />
            <Route path="/loginpage" element={<Loginpage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </>
      </BrowserRouter>
    </>
  )
}

export default App
