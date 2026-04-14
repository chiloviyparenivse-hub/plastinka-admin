import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Grid,
  CircularProgress,
  Chip,
  InputAdornment,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { styled } from '@mui/material/styles';
import api from '../services/api';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    background: '#1a1a2e',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.1)',
  },
});

const DropZone = styled(Paper)(({ theme, isDragActive }) => ({
  padding: '24px',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isDragActive ? 'rgba(102,126,234,0.1)' : 'rgba(255,255,255,0.03)',
  border: `1px dashed ${isDragActive ? '#667eea' : 'rgba(255,255,255,0.2)'}`,
  borderRadius: 12,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102,126,234,0.05)',
  },
}));

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
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

const UploadMP3 = ({ open, onClose, onUploadSuccess, genres }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genreId, setGenreId] = useState('');
  const [duration, setDuration] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [coverFromMetadata, setCoverFromMetadata] = useState(false);
  const [genreSearchTerm, setGenreSearchTerm] = useState('');
  const [filteredGenres, setFilteredGenres] = useState(genres);

  useEffect(() => {
    if (!genreSearchTerm.trim()) {
      setFilteredGenres(genres);
    } else {
      const searchLower = genreSearchTerm.toLowerCase();
      const filtered = genres.filter(genre =>
        genre.name.toLowerCase().includes(searchLower) ||
        (genre.key && genre.key.toLowerCase().includes(searchLower))
      );
      setFilteredGenres(filtered);
    }
  }, [genreSearchTerm, genres]);

  const onDropAudio = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file || !file.type.includes('audio/mpeg')) {
      setError('Выберите MP3 файл');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 50 MB');
      return;
    }

    setAudioFile(file);
    setError('');
    setExtracting(true);
    setCoverFromMetadata(false);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/admin/extract-metadata', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data) {
        if (response.data.title) setTitle(response.data.title);
        if (response.data.artist) setArtist(response.data.artist);
        if (response.data.duration) setDuration(response.data.duration.toString());
        
        if (response.data.cover) {
          setCoverPreview(`data:image/jpeg;base64,${response.data.cover}`);
          const coverBlob = base64ToBlob(response.data.cover, 'image/jpeg');
          const coverFileObj = new File([coverBlob], 'cover_from_metadata.jpg', { type: 'image/jpeg' });
          setCoverFile(coverFileObj);
          setCoverFromMetadata(true);
        }
        
        // Автоматический выбор жанра из метаданных
        if (response.data.genre || response.data.genreKey) {
          let matchedGenre = null;
          
          if (response.data.genreKey) {
            matchedGenre = genres.find(g => g.key === response.data.genreKey);
          }
          
          if (!matchedGenre && response.data.genre) {
            matchedGenre = genres.find(g => 
              g.name.toLowerCase() === response.data.genre.toLowerCase()
            );
          }
          
          if (!matchedGenre && response.data.genre) {
            const genreLower = response.data.genre.toLowerCase();
            matchedGenre = genres.find(g => 
              g.name.toLowerCase().includes(genreLower) ||
              genreLower.includes(g.name.toLowerCase())
            );
          }
          
          if (matchedGenre) {
            setGenreId(matchedGenre.id);
          }
        }
      }
    } catch (err) {
      console.error('Ошибка извлечения метаданных:', err);
    } finally {
      setExtracting(false);
    }
  }, [genres]);

  const base64ToBlob = (base64, type) => {
    const binary = atob(base64);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type });
  };

  const onDropCover = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setCoverFromMetadata(false);
      setError('');
    } else {
      setError('Выберите изображение');
    }
  }, []);

  const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps, isDragActive: isAudioDrag } = useDropzone({
    onDrop: onDropAudio,
    accept: { 'audio/mpeg': ['.mp3'] },
    maxFiles: 1,
  });

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDrag } = useDropzone({
    onDrop: onDropCover,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!audioFile || !title || !artist || !genreId || !duration) {
      setError('Заполните все поля');
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('genre_id', genreId);
    formData.append('duration_seconds', duration);

    try {
      setUploading(true);
      setError('');
      
      await api.post('/admin/tracks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      onUploadSuccess();
      handleClose();
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError('Ошибка при загрузке трека');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    setTitle('');
    setArtist('');
    setGenreId('');
    setDuration('');
    setError('');
    setProgress(0);
    setCoverFromMetadata(false);
    setGenreSearchTerm('');
    onClose();
  };

  const selectedGenre = genres.find(g => g.id === genreId);

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        Загрузить MP3 трек
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DropZone {...getAudioRootProps()} isDragActive={isAudioDrag}>
              <input {...getAudioInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: '#667eea', mb: 1 }} />
              <Typography sx={{ color: '#fff' }}>
                {audioFile ? audioFile.name : 'Перетащите MP3 файл или кликните'}
              </Typography>
              {audioFile && (
                <Typography variant="caption" sx={{ color: '#4caf50' }}>
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              )}
            </DropZone>
          </Grid>

          <Grid item xs={12} md={6}>
            <DropZone {...getCoverRootProps()} isDragActive={isCoverDrag}>
              <input {...getCoverInputProps()} />
              {coverPreview ? (
                <Box>
                  <img src={coverPreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 8 }} />
                  <Typography variant="caption" sx={{ color: '#fff', mt: 1, display: 'block' }}>
                    {coverFile?.name}
                  </Typography>
                  {coverFromMetadata && (
                    <Chip label="Извлечено из MP3" size="small" sx={{ mt: 1, bgcolor: 'rgba(76,175,80,0.2)', color: '#4caf50' }} />
                  )}
                </Box>
              ) : (
                <>
                  <ImageIcon sx={{ fontSize: 48, color: '#667eea', mb: 1 }} />
                  <Typography sx={{ color: '#fff' }}>Обложка (необязательно)</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Или будет извлечена из MP3
                  </Typography>
                </>
              )}
            </DropZone>
          </Grid>
        </Grid>

        {extracting && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 2 }}>
            <CircularProgress size={24} sx={{ color: '#667eea' }} />
            <Typography sx={{ color: '#fff' }}>Извлечение метаданных...</Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label="Название трека"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          disabled={uploading || extracting}
          sx={{ mt: 2 }}
          InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' } }}
          InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
        />
        
        <TextField
          fullWidth
          label="Исполнитель"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          margin="normal"
          required
          disabled={uploading || extracting}
          InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' } }}
          InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
        />
        
        {/* Жанр с поиском */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block' }}>
            Жанр
          </Typography>
          
          <SearchField
            fullWidth
            size="small"
            placeholder="Поиск жанра..."
            value={genreSearchTerm}
            onChange={(e) => setGenreSearchTerm(e.target.value)}
            disabled={uploading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: genreSearchTerm && (
                <InputAdornment position="end">
                  <ClearIcon 
                    sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer' }} 
                    onClick={() => setGenreSearchTerm('')}
                  />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />
          
          {selectedGenre && !genreSearchTerm && (
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={selectedGenre.name}
                onDelete={() => setGenreId('')}
                sx={{ 
                  bgcolor: 'rgba(102,126,234,0.2)',
                  color: '#667eea',
                  '& .MuiChip-deleteIcon': { color: '#667eea' }
                }}
              />
            </Box>
          )}
          
          {(genreSearchTerm || !selectedGenre) && (
            <Paper sx={{ 
              maxHeight: 200, 
              overflow: 'auto', 
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {filteredGenres.length > 0 ? (
                filteredGenres.map((genre) => (
                  <MenuItem
                    key={genre.id}
                    selected={genreId === genre.id}
                    onClick={() => {
                      setGenreId(genre.id);
                      setGenreSearchTerm('');
                    }}
                    sx={{
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(102,126,234,0.1)' },
                      '&.Mui-selected': { bgcolor: 'rgba(102,126,234,0.2)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography sx={{ flex: 1 }}>{genre.name}</Typography>
                      {genre.key && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                          {genre.key}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Жанр "{genreSearchTerm}" не найден
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Box>
        
        <TextField
          fullWidth
          label="Длительность (секунды)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          margin="normal"
          type="number"
          disabled={uploading}
          InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' } }}
          InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', display: 'block', mt: 1 }}>
              Загрузка: {progress}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
        <Button onClick={handleClose} disabled={uploading} sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Отмена
        </Button>
        <Button 
          onClick={handleUpload} 
          variant="contained" 
          disabled={uploading || extracting || !audioFile || !title || !artist || !genreId}
          sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#7b8eef' }, textTransform: 'none' }}
        >
          {uploading ? 'Загрузка...' : 'Загрузить'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default UploadMP3;