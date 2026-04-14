import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../services/api';

const StyledPaper = styled(Paper)({
  background: '#1a1a2e',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '40px',
  width: '100%',
  maxWidth: 400,
});

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        onLogin();
      }
    } catch (err) {
      setError(err.response?.status === 401 ? 'Неверный email или пароль' : 'Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0a0a1a',
      }}
    >
      <StyledPaper>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, textAlign: 'center', mb: 1 }}>
          Вход в админ-панель
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', mb: 4 }}>
          Дорожная Пластинка
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            margin="normal"
            autoFocus
            InputProps={{
              sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255,255,255,0.5)' }
            }}
          />
          
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            margin="normal"
            InputProps={{
              sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255,255,255,0.5)' }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.5,
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#7b8eef' },
              textTransform: 'none',
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Войти'}
          </Button>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default Login;