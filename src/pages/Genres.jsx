import React, { useState, useEffect } from 'react';
import {
  Container,
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
  Tooltip,
  InputAdornment,
  Grid,
  Paper,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Search, 
  Clear,
  LibraryMusic,
  Code,
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

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [filteredGenres, setFilteredGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGenre, setCurrentGenre] = useState({ key: '', name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    filterGenres();
  }, [searchTerm, genres]);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const response = await api.get('/genres');
      setGenres(response.data);
      setFilteredGenres(response.data);
      setError('');
      console.log(`Загружено ${response.data.length} жанров`);
    } catch (err) {
      setError('Не удалось загрузить жанры');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterGenres = () => {
    if (!searchTerm.trim()) {
      setFilteredGenres(genres);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = genres.filter(genre => 
      genre.name?.toLowerCase().includes(searchLower) ||
      genre.key?.toLowerCase().includes(searchLower) ||
      genre.description?.toLowerCase().includes(searchLower) ||
      genre.id?.toString().includes(searchLower)
    );
    setFilteredGenres(filtered);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleOpenDialog = (genre = null) => {
    if (genre) {
      setCurrentGenre({
        key: genre.key || '',
        name: genre.name,
        description: genre.description || ''
      });
    } else {
      setCurrentGenre({ key: '', name: '', description: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGenre({ key: '', name: '', description: '' });
  };

  const handleSave = async () => {
    if (!currentGenre.key.trim()) {
      alert('Ключ жанра обязателен');
      return;
    }
    if (!currentGenre.name.trim()) {
      alert('Название жанра обязательно');
      return;
    }

    // Проверка формата key (только латиница, цифры и нижнее подчеркивание)
    const keyRegex = /^[a-z][a-z0-9_]*$/i;
    if (!keyRegex.test(currentGenre.key)) {
      alert('Ключ должен содержать только латинские буквы, цифры и нижнее подчеркивание, и начинаться с буквы');
      return;
    }

    try {
      setSaving(true);
      const dataToSend = {
        key: currentGenre.key.toLowerCase(),
        name: currentGenre.name,
        description: currentGenre.description
      };
      
      if (currentGenre.id) {
        await api.put(`/admin/genres/${currentGenre.id}`, dataToSend);
        alert('Жанр обновлен');
      } else {
        await api.post('/admin/genres', dataToSend);
        alert('Жанр создан');
      }
      await loadGenres();
      handleCloseDialog();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка при сохранении жанра');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Вы уверены, что хотите удалить жанр "${name}"?`)) return;

    try {
      await api.delete(`/admin/genres/${id}`);
      alert('Жанр удален');
      await loadGenres();
    } catch (err) {
      alert(err.response?.data?.message || 'Нельзя удалить жанр, в котором есть треки');
      console.error(err);
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Управление жанрами
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #7b8eef, #8b5cb2)',
            }
          }}
        >
          Добавить жанр
        </Button>
      </Box>

      {/* Поиск */}
      <GlassPaper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <SearchField
              fullWidth
              size="small"
              placeholder="Поиск по ключу, названию или описанию..."
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
                label={`Найдено: ${filteredGenres.length} из ${genres.length}`}
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

      {filteredGenres.length === 0 && !error ? (
        <GradientPaper sx={{ p: 4, textAlign: 'center' }}>
          {searchTerm ? (
            <>
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
            </>
          ) : (
            <Typography color="rgba(255,255,255,0.7)">Нет жанров. Добавьте первый жанр!</Typography>
          )}
        </GradientPaper>
      ) : (
        <TableContainer component={GradientPaper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                <StyledTableHeaderCell>Ключ (key)</StyledTableHeaderCell>
                <StyledTableHeaderCell>Название</StyledTableHeaderCell>
                <StyledTableHeaderCell>Описание</StyledTableHeaderCell>
                <StyledTableHeaderCell align="right">Действия</StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGenres.map((genre) => (
                <TableRow key={genre.id} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' } }}>
                  <StyledTableCell>{genre.id}</StyledTableCell>
                  <StyledTableCell>
                    <Chip 
                      label={genre.key || '—'}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(102,126,234,0.2)',
                        color: '#667eea',
                        fontFamily: 'monospace',
                        fontSize: 12,
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" fontWeight="500" color="#fff">
                      {genre.name}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      {genre.description || '—'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Tooltip title="Редактировать">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(genre)}
                        sx={{ color: '#ff9800' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(genre.id, genre.name)}
                        sx={{ color: '#ff6b6b' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалог добавления/редактирования */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LibraryMusic sx={{ color: '#667eea' }} />
            {currentGenre.id ? 'Редактировать жанр' : 'Добавить жанр'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Ключ (key)"
            value={currentGenre.key}
            onChange={(e) => setCurrentGenre({ ...currentGenre, key: e.target.value.toLowerCase() })}
            margin="normal"
            required            
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputBase-input': { color: '#fff', fontFamily: 'monospace' },
            }}
          />
          <TextField
            fullWidth
            label="Название"
            value={currentGenre.name}
            onChange={(e) => setCurrentGenre({ ...currentGenre, name: e.target.value })}
            margin="normal"
            required
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
            label="Описание"
            multiline
            rows={3}
            value={currentGenre.description || ''}
            onChange={(e) => setCurrentGenre({ ...currentGenre, description: e.target.value })}
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
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{ color: '#667eea' }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={saving}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              '&:hover': { background: 'linear-gradient(135deg, #7b8eef, #8b5cb2)' }
            }}
          >
            {saving ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : (currentGenre.id ? 'Сохранить' : 'Создать')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Genres;