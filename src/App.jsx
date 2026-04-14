import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tracks from './pages/Tracks';
import Genres from './pages/Genres';
import Users from './pages/Users';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('adminToken')
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          
          <Route
            path="/"
            element={
              isAuthenticated ? 
              <Layout onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tracks" element={<Tracks />} />
            <Route path="genres" element={<Genres />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;