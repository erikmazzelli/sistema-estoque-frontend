'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Divider,
  ListItemButton,
  Stack,
  CircularProgress,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { BarChart } from '@mui/icons-material';

import { Logo } from '@/public/logo';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const drawerWidth = 240;

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant='h6'>Meu Estoque</Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={pathname.includes('/dashboard')}
            onClick={() => router.push('/dashboard')}
          >
            <ListItemIcon>
              <BarChart />
            </ListItemIcon>
            <ListItemText primary='Dashboard' />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            selected={pathname.includes('/categories')}
            onClick={() => router.push('/categories')}
          >
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary='Categorias' />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary='Sair' />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <AuthProvider>
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position='fixed'
          sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='abrir menu'
              edge='start'
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Stack direction='row' alignItems='center' gap={1}>
              <Logo width={72} height={72} variant='secondary' />
              <Typography variant='h6' noWrap>
                BluWare
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>

        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', sm: 'block' },
            width: drawerWidth,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          open
        >
          {drawer}
        </Drawer>

        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: 'block', sm: 'none' },
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>

        <Box
          component='main'
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </AuthProvider>
  );
}
