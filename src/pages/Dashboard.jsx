import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  MusicNote,
  Category,
  People,
  AccessTime,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../services/api';

const GlassCard = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.1)',
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState({
    tracks: 0,
    genres: 0,
    users: 0,
    totalHours: 0,
    totalMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const tracksRes = await api.get('/tracks');
      const tracks = tracksRes.data;
      
      const genresRes = await api.get('/genres');
      const genres = genresRes.data;
      
      let users = 0;
      try {
        const usersRes = await api.get('/admin/users');
        users = usersRes.data.length;
      } catch {
        users = 0;
      }

      const totalSeconds = tracks.reduce((sum, track) => sum + (track.duration_seconds || 0), 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      setStats({
        tracks: tracks.length,
        genres: genres.length,
        users: users,
        totalHours: hours,
        totalMinutes: minutes,
      });
      
      setError('');
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      setError('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
        <GlassCard>
          <Typography sx={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</Typography>
        </GlassCard>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          color: '#fff',
          mb: { xs: 2, sm: 4 }
        }}
      >
        Обзор
      </Typography>

      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={6} sm={6} md={3}>
          <GlassCard>
            <StatBox>
              <MusicNote sx={{ fontSize: { xs: 32, sm: 40 }, color: '#667eea', mb: 1 }} />
              <Typography variant={isMobile ? "h4" : "h3"} sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}>
                {stats.tracks}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                треков
              </Typography>
            </StatBox>
          </GlassCard>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <GlassCard>
            <StatBox>
              <Category sx={{ fontSize: { xs: 32, sm: 40 }, color: '#4caf50', mb: 1 }} />
              <Typography variant={isMobile ? "h4" : "h3"} sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}>
                {stats.genres}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                жанров
              </Typography>
            </StatBox>
          </GlassCard>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <GlassCard>
            <StatBox>
              <People sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ff9800', mb: 1 }} />
              <Typography variant={isMobile ? "h4" : "h3"} sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}>
                {stats.users}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                пользователей
              </Typography>
            </StatBox>
          </GlassCard>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <GlassCard>
            <StatBox>
              <AccessTime sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ff6b6b', mb: 1 }} />
              <Typography variant={isMobile ? "h6" : "h3"} sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1rem', sm: '1.2rem', md: '3rem' } }}>
                {stats.totalHours} ч {stats.totalMinutes} мин
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                всего музыки
              </Typography>
            </StatBox>
          </GlassCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;