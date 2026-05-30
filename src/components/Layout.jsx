import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Container,
  CssBaseline,
} from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { styled } from '@mui/material/styles';

const drawerWidth = 260;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(26,26,46,0.95) 0%, rgba(22,33,62,0.95) 50%, rgba(15,52,96,0.95) 100%)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledListItem = styled(ListItem, { shouldForwardProp: (prop) => prop !== 'active' })(
  ({ theme, active }) => ({
    borderRadius: 12,
    marginBottom: 4,
    marginLeft: 8,
    marginRight: 8,
    transition: 'all 0.3s ease',
    backgroundColor: active ? 'rgba(102,126,234,0.15)' : 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(102,126,234,0.1)',
      transform: 'translateX(4px)',
    },
    '& .MuiListItemIcon-root': {
      color: active ? '#667eea' : 'rgba(255,255,255,0.6)',
      minWidth: 40,
    },
    '& .MuiListItemText-primary': {
      color: active ? '#fff' : 'rgba(255,255,255,0.7)',
      fontWeight: active ? 600 : 400,
    },
  })
);

const Layout = ({ onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Управление состоянием панели
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else if (isTablet) {
      setDrawerOpen(false);
    } else if (isDesktop) {
      setDrawerOpen(true);
    }
  }, [isMobile, isTablet, isDesktop]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
    { text: 'Треки', icon: <MusicNoteIcon />, path: '/tracks' },
    { text: 'Жанры', icon: <CategoryIcon />, path: '/genres' },
    { text: 'Пользователи', icon: <PeopleIcon />, path: '/users' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Содержимое боковой панели
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Логотип - всегда виден */}
      <Box 
        sx={{ 
          p: 2, 
          pt: 3, 
          pb: 2, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 0.5,
          }}
        >
          Пластинка
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.5)',
            display: 'block',
          }}
        >
          Админ-панель
        </Typography>
      </Box>

      {/* Меню */}
      <Box sx={{ flex: 1, mt: 2 }}>
        <List component="nav">
          {menuItems.map((item) => (
            <StyledListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => {
                if (isMobile) setMobileOpen(false);
              }}
              active={isActive(item.path) ? 1 : 0}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItem>
          ))}
        </List>
      </Box>

      {/* Футер */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)', mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <EqualizerIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            Версия 1.0.0
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }} display="block" textAlign="center">
          © 2026 Пластинка
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0a1a' }}>
      <CssBaseline />
      
      {/* Верхняя панель */}
      <StyledAppBar position="fixed" elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: '#fff' }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 500, color: '#fff' }}>
            Панель управления
          </Typography>

          <Button
            color="inherit"
            onClick={handleMenuOpen}
            startIcon={
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  boxShadow: '0 2px 8px rgba(102,126,234,0.3)',
                }}
              >
                A
              </Avatar>
            }
            sx={{
              textTransform: 'none',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            {!isMobile && 'Администратор'}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                mt: 1,
              },
            }}
          >
            <MenuItem onClick={handleMenuClose} sx={{ color: '#fff' }}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" sx={{ color: '#667eea' }} />
              </ListItemIcon>
              <ListItemText>Профиль</ListItemText>
            </MenuItem>
            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <MenuItem onClick={handleLogout} sx={{ color: '#fff' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#ff6b6b' }} />
              </ListItemIcon>
              <ListItemText>Выйти</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>

      {/* Мобильный Drawer (выезжающий) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Десктопный Drawer (постоянный, сворачиваемый) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerOpen ? drawerWidth : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidth : 72,
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        open={drawerOpen}
      >
        {/* Свёрнутая версия - только иконки */}
        {!drawerOpen ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ p: 2, pt: 3, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                П
              </Typography>
            </Box>
            <Box sx={{ flex: 1, mt: 2 }}>
              <List>
                {menuItems.map((item) => (
                  <ListItem
                    button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    sx={{
                      justifyContent: 'center',
                      borderRadius: 12,
                      mb: 1,
                      mx: 1,
                      backgroundColor: isActive(item.path) ? 'rgba(102,126,234,0.15)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(102,126,234,0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 'auto', color: isActive(item.path) ? '#667eea' : 'rgba(255,255,255,0.6)' }}>
                      {item.icon}
                    </ListItemIcon>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <EqualizerIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', display: 'block', mx: 'auto' }} />
            </Box>
          </Box>
        ) : (
          drawerContent
        )}
      </Drawer>

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          backgroundColor: '#0a0a1a',
          minHeight: '100vh',
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 72}px)` },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        <Container 
          maxWidth={false}
          disableGutters
          sx={{ 
            width: '100%',
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;