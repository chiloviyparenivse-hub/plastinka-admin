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

const drawerWidth = 280;
const miniDrawerWidth = 72;

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: open ? drawerWidth : miniDrawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paper': {
      width: open ? drawerWidth : miniDrawerWidth,
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      overflowX: 'hidden',
      position: 'relative',
      zIndex: 1100,
    },
    [theme.breakpoints.down('md')]: {
      width: drawerWidth,
    },
  })
);

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(26,26,46,0.95) 0%, rgba(22,33,62,0.95) 50%, rgba(15,52,96,0.95) 100%)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  zIndex: theme.zIndex.drawer + 1,
  [theme.breakpoints.down('sm')]: {
    '& .MuiToolbar-root': {
      minHeight: 56,
      padding: '0 8px',
    },
  },
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
      fontSize: theme.breakpoints.down('md') ? '0.875rem' : '1rem',
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: 4,
      marginRight: 4,
      '& .MuiListItemIcon-root': {
        minWidth: 36,
      },
    },
  })
);

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: '#0a0a1a',
  minHeight: '100vh',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
  [theme.breakpoints.between('sm', 'md')]: {
    padding: theme.spacing(2),
  },
}));

const Layout = ({ onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    if (isTablet) {
      setDrawerOpen(false);
    } else if (isDesktop) {
      setDrawerOpen(true);
    }
  }, [isTablet, isDesktop]);

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

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant={drawerOpen && !isMobile ? 'h6' : 'subtitle2'}
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            {drawerOpen && !isMobile ? 'Пластинка' : 'П'}
          </Typography>
          {drawerOpen && !isMobile && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Админ-панель
            </Typography>
          )}
        </Box>
      </Toolbar>

      <Box sx={{ flex: 1, mt: 3 }}>
        <List component="nav">
          {menuItems.map((item) => (
            <StyledListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              active={isActive(item.path) ? 1 : 0}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {(drawerOpen || !isDesktop) && <ListItemText primary={item.text} />}
              {(drawerOpen || !isDesktop) && isActive(item.path) && (
                <Box
                  sx={{
                    width: 3,
                    height: 20,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: 1.5,
                  }}
                />
              )}
            </StyledListItem>
          ))}
        </List>
      </Box>

      {(drawerOpen || !isDesktop) && (
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
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0a1a' }}>
      <CssBaseline />
      
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

          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 500, color: '#fff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Панель управления
          </Typography>

          <Button
            color="inherit"
            onClick={handleMenuOpen}
            startIcon={
              <Avatar
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
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

      <StyledDrawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {drawerContent}
      </StyledDrawer>

      <MainContent>
        <Toolbar />
        <Container 
          maxWidth={false}
          disableGutters
          sx={{ 
            px: { xs: 0, sm: 1, md: 2 },
            width: '100%',
          }}
        >
          <Outlet />
        </Container>
      </MainContent>
    </Box>
  );
};

export default Layout;