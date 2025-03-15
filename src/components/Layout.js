import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  PersonAdd,
  DataUsage,
  Logout,
  DataArrayTwoTone,
  ChevronLeft,
} from '@mui/icons-material';

const drawerWidth = 240;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin-panel/dashboard' },
    { text: 'All Personnel', icon: <DataUsage />, path: '/admin-panel/personnel' },
    { text: 'Health Alerts', icon: <DataUsage />, path: '/admin-panel/alerts' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Clear local storage/auth state
    localStorage.removeItem('token');
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(195deg, #1a1a1a 0%, #000000 100%)',
      borderRight: '1px solid rgba(255,68,68,0.1)'
    }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          transition: 'filter 0.2s ease',
          '&:hover': {
            filter: 'drop-shadow(0 0 10px rgba(218,165,32,0.7))'
          }
        }}>
          <img 
            src="/logos/emblem.png" 
            alt="Emblem" 
            style={{ 
              width: '50px',
              filter: 'drop-shadow(0 0 8px rgba(255,68,68,0.5))' 
            }} 
          />
        </Box>
        <Divider sx={{
          mt: 2,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          height: '2px',
          width: '90%',
          mx: 'auto',
          borderRadius: '4px',
          boxShadow: '0 0 8px rgba(255,255,255,0.1)',
          '&:hover': {
            background: 'linear-gradient(90deg, transparent, rgba(255,68,68,0.2), transparent)',
            boxShadow: '0 0 12px rgba(255,68,68,0.15)'
          },
          transition: 'all 0.3s ease'
        }} />
        {/* <Box sx={{
            marginTop: 2,
            marginBottom: 1,
            borderRadius: '50%', // Make the div round
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'filter 0.2s ease',
            '&:hover': {
              filter: 'drop-shadow(0 0 10px rgba(218,165,32,0.7))', // Golden glow on hover
            }
          }}>
            <img 
              alt="Digiswasth Logo"
              height={100}
              width={140}
              src="/logos/Digiswasth.png"/>
          </Box>
        
       */}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
 
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 1
      }}>
        <Box sx={{
            borderRadius: '50%', // Make the div round
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'filter 0.2s ease',
            '&:hover': {
              filter: 'drop-shadow(0 0 10px rgba(218,165,32,0.7))', // Golden glow on hover
            }
          }}>
            <img 
              alt="Digiswasth Logo"
              height={65}
              width={80}
              src="/logos/Digiswasth.png"/>
          </Box>
        <Typography variant="h6" sx={{ 
          color: '#ffffff',
          mt: 1,
          fontSize: '18px',
          fontStyle: 'italic'
        }}>
          DIGISWASTH
        </Typography>
        <Typography variant="h6" sx={{ 
          color: '#ff4444',
          
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          Revive Strive Thrive
        </Typography>
      </Box>
          </Box>
      {/* Images Section */}
      <Box sx={{
        p: 2,
        flexGrow: 1,
        overflow: 'hidden',
        '&:hover img': {
          transform: 'scale(1.05)',
          transition: 'transform 0.3s ease'
        }
      }}>
        <Box sx={{ 
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(2, 1fr)'
        }}>
          {[1, 2, 3, 4].map((num) => (
            <img
              key={num}
              src={`/images/${num}.jpg`}
              alt={`Military Badge ${num}`}
              style={{
                width: '100%',
                borderRadius: '8px',
                aspectRatio: '1/1',
                objectFit: 'cover'
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Logout Section */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,68,68,0.1)' }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection:'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mb: 2,
          transition: 'filter 0.2s ease',
          '&:hover': {
            filter: 'drop-shadow(0 0 10px rgba(218,165,32,0.7))', // Golden glow on hover
          }
        }}>
          
          <img 
            src="/logos/AFMS2.png" 
            alt="AFMS Logo" 
            style={{
              width: '100px',
            }}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 },
          '& .MuiDrawer-paper': {
            top: 0,
            height: '100vh',
            background: 'linear-gradient(195deg, #1a1a1a 0%, #000000 100%)',
            borderRight: '1px solid rgba(255,68,68,0.1)',
          }
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar 
          position="static" 
          sx={{ 
            background: 'linear-gradient(145deg, #400000 0%, #000000 100%)',
            boxShadow: '0 4px 20px rgba(255, 68, 68, 0.2)',
            width: '100%',
            ml: 0,
          }}
        >
          <Toolbar sx={{ 
            width: '100%',
            px: 4,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: location.pathname === item.path ? '#ff4444' : '#cccccc',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'rgba(255,68,68,0.1)'
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
            <Button
              onClick={handleLogout}
              startIcon={<Logout sx={{ color: '#ff4444' }} />}
              sx={{
                color: '#cccccc',
                '&:hover': {
                  background: 'rgba(255,68,68,0.1)',
                  color: '#ffffff'
                }
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
} 