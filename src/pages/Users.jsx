import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Tooltip,
  InputAdornment,
  Grid,
  MenuItem,
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Visibility,
  MusicNote,
  PlaylistPlay,
  Schedule,
  Search,
  Clear,
  Person,
  Email,
  CalendarToday,
  Stars,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../services/api';

// Стилизованные компоненты в стиле приложения
const GradientPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
}));

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(102,126,234,0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.7)',
  },
  '& .MuiInputBase-input': {
    color: '#fff',
    fontSize: '14px',
    padding: '12px 14px',
  },
});

const StyledTableCell = styled(TableCell)({
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
});

const StyledTableHeaderCell = styled(TableCell)({
  borderBottom: '2px solid rgba(102,126,234,0.3)',
  color: '#667eea',
  fontWeight: 600,
  fontSize: 14,
});

const PremiumBadge = styled(Chip)({
  backgroundColor: 'rgba(255,215,0,0.2)',
  color: '#FFD700',
  border: '1px solid rgba(255,215,0,0.3)',
  fontWeight: 500,
  '& .MuiChip-icon': {
    color: '#FFD700',
  },
});

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    email: '',
    subscription_type: 'free',
    subscription_expires_at: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      
      if (Array.isArray(response.data)) {
        setUsers(response.data);
        setFilteredUsers(response.data);
        console.log(`Загружено ${response.data.length} пользователей`);
      } else {
        setError('Неверный формат данных от сервера');
      }
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
      setError(`Не удалось загрузить пользователей: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.nickname?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.id?.toString().includes(searchLower)
    );
    setFilteredUsers(filtered);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleViewUser = async (user) => {
    try {
      const response = await api.get(`/admin/users/${user.id}`);
      setSelectedUser(response.data);
      setViewDialogOpen(true);
    } catch (err) {
      console.error('Ошибка загрузки пользователя:', err);
      alert('Ошибка загрузки данных пользователя');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      nickname: user.nickname,
      email: user.email,
      subscription_type: user.subscription_type || 'free',
      subscription_expires_at: user.subscription_expires_at ? user.subscription_expires_at.split('T')[0] : '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editForm.nickname.trim()) {
      alert('Никнейм не может быть пустым');
      return;
    }
    
    if (!editForm.email.trim()) {
      alert('Email не может быть пустым');
      return;
    }

    try {
      setSaving(true);
      console.log('Отправка данных на сервер:', {
        id: selectedUser.id,
        nickname: editForm.nickname,
        email: editForm.email,
        subscription_type: editForm.subscription_type,
        subscription_expires_at: editForm.subscription_expires_at || null
      });
      
      const response = await api.put(`/admin/users/${selectedUser.id}`, {
        nickname: editForm.nickname,
        email: editForm.email,
        subscription_type: editForm.subscription_type,
        subscription_expires_at: editForm.subscription_expires_at || null
      });
      
      console.log('Ответ сервера:', response.data);
      await loadUsers();
      setEditDialogOpen(false);
      alert('Пользователь обновлен');
    } catch (err) {
      console.error('Ошибка обновления:', err.response?.data || err.message);
      alert(`Ошибка при обновлении пользователя: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Вы уверены, что хотите удалить пользователя "${user.nickname}"? Все его плейлисты будут также удалены.`)) return;

    try {
      await api.delete(`/admin/users/${user.id}`);
      await loadUsers();
      alert('Пользователь удален');
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка при удалении пользователя');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 ч';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
    }
    return `${minutes} мин`;
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          mb: 3
        }}
      >
        Управление пользователями
      </Typography>

      {/* Поиск */}
      <GlassPaper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <SearchField
              fullWidth
              size="small"
              placeholder="Поиск по никнейму, email или ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Chip 
                label={`Найдено: ${filteredUsers.length} из ${users.length}`}
                sx={{ 
                  backgroundColor: 'rgba(102,126,234,0.2)',
                  color: '#667eea',
                  border: '1px solid rgba(102,126,234,0.3)',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </GlassPaper>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {filteredUsers.length === 0 && !error && !searchTerm ? (
        <GradientPaper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="rgba(255,255,255,0.7)">Нет пользователей</Typography>
        </GradientPaper>
      ) : filteredUsers.length === 0 && searchTerm ? (
        <GradientPaper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="rgba(255,255,255,0.7)" gutterBottom>
            По запросу "{searchTerm}" ничего не найдено
          </Typography>
          <Button 
            onClick={handleClearSearch}
            sx={{ 
              color: '#667eea',
              '&:hover': { backgroundColor: 'rgba(102,126,234,0.1)' }
            }}
          >
            Очистить поиск
          </Button>
        </GradientPaper>
      ) : (
        <TableContainer component={GradientPaper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                <StyledTableHeaderCell>Пользователь</StyledTableHeaderCell>
                <StyledTableHeaderCell>Email</StyledTableHeaderCell>
                <StyledTableHeaderCell>Статус</StyledTableHeaderCell>
                <StyledTableHeaderCell>Подписка до</StyledTableHeaderCell>
                <StyledTableHeaderCell>Плейлистов</StyledTableHeaderCell>
                <StyledTableHeaderCell>Треков</StyledTableHeaderCell>
                <StyledTableHeaderCell>Дата регистрации</StyledTableHeaderCell>
                <StyledTableHeaderCell align="right">Действия</StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const isPremium = user.subscription_type === 'premium';
                const isExpired = user.subscription_expires_at && new Date(user.subscription_expires_at) <= new Date();
                const isActivePremium = isPremium && !isExpired;
                
                return (
                  <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' } }}>
                    <StyledTableCell>{user.id}</StyledTableCell>
                    <StyledTableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            background: isActivePremium 
                              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                              : 'linear-gradient(135deg, #667eea, #764ba2)',
                            boxShadow: isActivePremium ? '0 2px 8px rgba(255,215,0,0.3)' : '0 2px 8px rgba(102,126,234,0.3)'
                          }}
                        >
                          {user.nickname?.charAt(0).toUpperCase() || <Person />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500" color="#fff">
                            {user.nickname}
                          </Typography>
                          {isActivePremium && (
                            <PremiumBadge
                              icon={<Stars sx={{ fontSize: 14 }} />}
                              label="PREMIUM"
                              size="small"
                              sx={{ mt: 0.5, height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="body2" color="rgba(255,255,255,0.8)">
                          {user.email}
                        </Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip 
                        label={isActivePremium ? 'Premium' : 'Free'}
                        size="small"
                        sx={{ 
                          backgroundColor: isActivePremium ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)',
                          color: isActivePremium ? '#FFD700' : 'rgba(255,255,255,0.7)',
                          fontWeight: 500,
                          border: isActivePremium ? '1px solid rgba(255,215,0,0.3)' : 'none',
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        {user.subscription_expires_at ? formatExpiryDate(user.subscription_expires_at) : '—'}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip 
                        label={user.playlists_count || 0}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(102,126,234,0.2)',
                          color: '#667eea',
                          fontWeight: 500,
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip 
                        label={user.total_tracks || 0}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(76,175,80,0.2)',
                          color: '#4caf50',
                          fontWeight: 500,
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="body2" color="rgba(255,255,255,0.8)">
                          {formatDate(user.created_at)}
                        </Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Tooltip title="Просмотр">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewUser(user)}
                          sx={{ color: '#667eea' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditUser(user)}
                          sx={{ color: '#ff9800' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteUser(user)}
                          sx={{ color: '#ff6b6b' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалог просмотра пользователя */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Информация о пользователе
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedUser && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    background: selectedUser.subscription_type === 'premium' 
                      ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                      : 'linear-gradient(135deg, #667eea, #764ba2)',
                    boxShadow: selectedUser.subscription_type === 'premium' 
                      ? '0 4px 16px rgba(255,215,0,0.4)'
                      : '0 4px 16px rgba(102,126,234,0.4)',
                    fontSize: 40
                  }}
                >
                  {selectedUser.nickname?.charAt(0).toUpperCase() || <Person />}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
                      {selectedUser.nickname}
                    </Typography>
                    {selectedUser.subscription_type === 'premium' && (
                      <PremiumBadge
                        icon={<Stars sx={{ fontSize: 16 }} />}
                        label="PREMIUM"
                        size="small"
                      />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {selectedUser.email}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    ID: {selectedUser.id}
                  </Typography>
                  {selectedUser.subscription_expires_at && (
                    <Typography variant="caption" sx={{ color: '#FFD700', display: 'block', mt: 1 }}>
                      Подписка до: {formatExpiryDate(selectedUser.subscription_expires_at)}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Typography variant="subtitle1" sx={{ color: '#667eea', fontWeight: 600, mb: 2 }}>
                Статистика
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <GlassPaper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                  <PlaylistPlay sx={{ color: '#667eea', fontSize: 32, mb: 1 }} />
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 600 }}>
                    {selectedUser.playlists_count || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Плейлистов
                  </Typography>
                </GlassPaper>
                <GlassPaper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                  <MusicNote sx={{ color: '#4caf50', fontSize: 32, mb: 1 }} />
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 600 }}>
                    {selectedUser.total_tracks || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Треков
                  </Typography>
                </GlassPaper>
                <GlassPaper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                  <Schedule sx={{ color: '#ff9800', fontSize: 32, mb: 1 }} />
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 600 }}>
                    {formatDuration(selectedUser.total_duration)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Всего времени
                  </Typography>
                </GlassPaper>
              </Box>

              <Typography variant="subtitle1" sx={{ color: '#667eea', fontWeight: 600, mb: 2 }}>
                Плейлисты
              </Typography>
              <TableContainer component={GlassPaper} sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#667eea' }}>Название</TableCell>
                      <TableCell sx={{ color: '#667eea' }}>Треков</TableCell>
                      <TableCell sx={{ color: '#667eea' }}>Длительность</TableCell>
                      <TableCell sx={{ color: '#667eea' }}>Создан</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedUser.playlists?.map((playlist) => (
                      <TableRow key={playlist.id}>
                        <TableCell sx={{ color: '#fff' }}>{playlist.name}</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{playlist.tracks_count || 0}</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{formatDuration(playlist.total_duration_seconds)}</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{formatDate(playlist.created_at)}</TableCell>
                      </TableRow>
                    ))}
                    {(!selectedUser.playlists || selectedUser.playlists.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          Нет плейлистов
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            sx={{ color: '#667eea' }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Редактировать пользователя
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Никнейм"
            value={editForm.nickname}
            onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputBase-input': { color: '#fff' },
            }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputBase-input': { color: '#fff' },
            }}
          />
          <TextField
            fullWidth
            select
            label="Тип подписки"
            value={editForm.subscription_type || 'free'}
            onChange={(e) => setEditForm({...editForm, subscription_type: e.target.value})}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
            }}
          >
            <MenuItem value="free">Free (бесплатный)</MenuItem>
            <MenuItem value="premium">Premium (премиум)</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Дата окончания подписки"
            type="date"
            value={editForm.subscription_expires_at || ''}
            onChange={(e) => setEditForm({...editForm, subscription_expires_at: e.target.value})}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputBase-input': { color: '#fff' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            disabled={saving}
            sx={{ color: '#667eea' }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            disabled={saving}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              '&:hover': { background: 'linear-gradient(135deg, #7b8eef, #8b5cb2)' }
            }}
          >
            {saving ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;