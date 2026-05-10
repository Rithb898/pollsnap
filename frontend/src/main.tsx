import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import App from './App.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <TooltipProvider>
          <Route path="/" element={<App />} />
        </TooltipProvider>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
