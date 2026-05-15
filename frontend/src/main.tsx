import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router"
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { Toaster } from 'sonner'

import RootLayout from './components/layouts/RootLayout'
import AuthLayout from './components/layouts/AuthLayout'
import DashboardLayout from './components/layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import PublicPoll from './pages/PublicPoll'

import CreatePoll from './pages/CreatePoll'
import EditPoll from './pages/EditPoll'
import PollAnalytics from './pages/PollAnalytics'
import Analytics from './pages/Analytics'
import Polls from './pages/Polls'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/poll/:pollId" element={<PublicPoll />} />

          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/polls" element={<Polls />} />
            <Route path="/polls/new" element={<CreatePoll />} />
            <Route path="/polls/:pollId/edit" element={<EditPoll />} />
            <Route path="/polls/:pollId/analytics" element={<PollAnalytics />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>,
)
