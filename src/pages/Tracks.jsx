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
  MenuItem,
  InputAdornment,
  Grid,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  MusicNote, 
  CloudUpload, 
  Search, 
  Clear,
  AccessTime,
  Person,
  Title,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../services/api';
import UploadMP3 from '../components/UploadMP3';

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  overflowX: 'auto',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
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
  '& .MuiInputAdornment-root svg': {
    color: 'rgba(255,255,255,0.5)',
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

const Tracks = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tracks, setTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    artist: '',
    genre_id: '',
    duration_seconds: ''
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tracksRes, genresRes] = await Promise.all([
        api.get('/tracks'),
        api.get('/genres')
      ]);
      setTracks(tracksRes.data);
      setGenres(genresRes.data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Вы уверены, что хотите удалить трек "${title}"?`)) return;

    try {
      await api.delete(`/admin/tracks/${id}`);
      await loadData();
      alert('Трек успешно удален');
    } catch (err) {
      alert('Ошибка при удалении трека');
      console.error(err);
    }
  };

  const handleEdit = (track) => {
    setEditingTrack(track);
    setEditForm({
      title: track.title,
      artist: track.artist,
      genre_id: track.genre_id,
      duration_seconds: track.duration_seconds
    });
    setCoverFile(null);
    setCoverPreview(null);
    setEditDialogOpen(true);
  };

  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSave = async () => {
    try {
      setEditLoading(true);
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('artist', editForm.artist);
      formData.append('genre_id', editForm.genre_id);
      formData.append('duration_seconds', editForm.duration_seconds);
      
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      await api.put(`/admin/tracks/${editingTrack.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setEditDialogOpen(false);
      await loadData();
      alert('Трек успешно обновлен');
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Ошибка при обновлении трека: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadData();
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = searchTerm === '' || 
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            fontWeight: 600, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Управление треками
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<MusicNote />}
          onClick={() => setUploadOpen(true)}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            px: { xs: 2, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            '&:hover': {
              background: 'linear-gradient(135deg, #7b8eef, #8b5cb2)',
            }
          }}
        >
          Загрузить MP3
        </Button>
      </Box>

      <GlassPaper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <SearchField
              fullWidth
              size="small"
              placeholder="Поиск по названию или исполнителю..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Chip 
                label={`Найдено: ${filteredTracks.length} из ${tracks.length}`}
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

      {filteredTracks.length === 0 && !error ? (
        <GradientPaper sx={{ p: 4, textAlign: 'center' }}>
          {searchTerm ? (
            <>
              <Typography color="rgba(255,255,255,0.7)" gutterBottom>
                По запросу "{searchTerm}" ничего не найдено
              </Typography>
              <Button 
                onClick={() => setSearchTerm('')}
                sx={{ 
                  color: '#667eea',
                  '&:hover': { backgroundColor: 'rgba(102,126,234,0.1)' }
                }}
              >
                Очистить поиск
              </Button>
            </>
          ) : (
            <Typography color="rgba(255,255,255,0.7)">Нет треков. Загрузите первый MP3!</Typography>
          )}
        </GradientPaper>
      ) : (
        <TableContainer component={GradientPaper}>
          <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                <StyledTableHeaderCell>Название</StyledTableHeaderCell>
                <StyledTableHeaderCell>Исполнитель</StyledTableHeaderCell>
                <StyledTableHeaderCell>Жанр</StyledTableHeaderCell>
                <StyledTableHeaderCell>Длительность</StyledTableHeaderCell>
                <StyledTableHeaderCell align="right">Действия</StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTracks.map((track) => (
                <TableRow key={track.id} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' } }}>
                  <StyledTableCell>{track.id}</StyledTableCell>
                  <StyledTableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Title sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                      <Typography variant="body2" fontWeight="500" color="#fff">
                        {track.title}
                      </Typography>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        {track.artist}
                      </Typography>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Chip 
                      label={track.genre_name} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(102,126,234,0.2)',
                        color: '#667eea',
                        fontWeight: 500,
                        border: '1px solid rgba(102,126,234,0.3)',
                      }} 
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        {formatDuration(track.duration_seconds)}
                      </Typography>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Tooltip title="Редактировать">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(track)}
                        sx={{ color: '#ff9800' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(track.id, track.title)}
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

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: isMobile ? 0 : 3,
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MusicNote sx={{ color: '#667eea' }} />
            Редактировать трек
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Название трека"
            value={editForm.title}
            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
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
            label="Исполнитель"
            value={editForm.artist}
            onChange={(e) => setEditForm({...editForm, artist: e.target.value})}
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
            label="Жанр"
            value={editForm.genre_id}
            onChange={(e) => setEditForm({...editForm, genre_id: e.target.value})}
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
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    bgcolor: '#1a1a2e',
                    backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  },
                },
              },
            }}
          >
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={genre.id} sx={{ color: '#fff' }}>
                {genre.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Длительность (секунды)"
            type="number"
            value={editForm.duration_seconds}
            onChange={(e) => setEditForm({...editForm, duration_seconds: e.target.value})}
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

          <Box sx={{ mt: 3, mb: 2, p: 2, borderRadius: 2, border: '1px dashed rgba(255,255,255,0.2)' }}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              Обложка трека
            </Typography>
            
            {coverPreview && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <img 
                  src={coverPreview} 
                  alt="preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 150, 
                    borderRadius: 8,
                    marginBottom: 8 
                  }} 
                />
              </Box>
            )}

            {editingTrack?.cover_url && !coverFile && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Текущая обложка:
                </Typography>
                <img 
                  src={`http://192.168.0.198:5000${editingTrack.cover_url}`} 
                  alt="current cover"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 100, 
                    borderRadius: 8,
                    marginTop: 4,
                    display: 'block',
                    margin: '0 auto'
                  }} 
                />
              </Box>
            )}

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#fff',
                '&:hover': {
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102,126,234,0.1)',
                }
              }}
            >
              {coverFile ? 'Обложка выбрана' : 'Загрузить обложку'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleCoverChange}
              />
            </Button>
            
            {coverFile && (
              <Typography variant="caption" display="block" sx={{ mt: 1, color: '#4caf50' }}>
                ✓ Выбрано: {coverFile.name} ({(coverFile.size / 1024).toFixed(1)} KB)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            disabled={editLoading}
            sx={{ color: '#667eea', width: { xs: '100%', sm: 'auto' } }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained" 
            disabled={editLoading}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              '&:hover': { background: 'linear-gradient(135deg, #7b8eef, #8b5cb2)' },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {editLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      <UploadMP3
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        genres={genres}
      />
    </Container>
  );
};

export default Tracks;