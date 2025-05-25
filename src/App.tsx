import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './integrations/supabase/client';
import { Toaster } from '@/components/ui/toaster';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InstagramCallback from './pages/InstagramCallback';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/instagram-callback" element={<InstagramCallback />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </SessionContextProvider>
  );
}

export default App;