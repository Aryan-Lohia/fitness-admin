import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { loginAdmin } from '../services/api';

const validationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required'),
  password: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

export default function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await loginAdmin(values);
        localStorage.setItem('token', response.token);
        navigate('/admin-panel/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
      }
    },
  });

  return (
    <Box component="main" 
    sx={{
      background: 'linear-gradient(145deg, rgba(255,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
      minHeight: '100vh', display:'flex' ,alignItems:'center'}}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          pt: 6,
          pb:1,
          margin: '0 auto' // Added margin auto to center horizontally
        }}
      >
         <Box sx={{
            marginBottom: 0,
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
              height={130}
              src="/logos/emblem.png"/>
          </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          justifyContent: 'center',
        }}>
         <Box sx={{
            marginBottom: 3,
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
              height={145}
              width={205}
              src="/logos/Digiswasth.png"/>
          </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          
        }}>
        <Typography 
            component="h1" 
            variant="h2" 
            align="center" 
            sx={{ 
              color: '#ffffff',

              textShadow: '0 0 10px rgba(255,68,68,0.5)',
              letterSpacing: '1.5px',
              fontWeight: 'bold'
            }}
          >
            DIGISWASTH
          </Typography>
        <Typography 
            component="h1" 
            variant="h3" 
            align="center" 
            sx={{ 
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255,68,68,0.5)',
              letterSpacing: '1.5px',
              mb: 4
            }}
          >
             Revive Strive Thrive
          </Typography>
        </Box>
        <Box sx={{
            marginBottom: 3,
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
          src="/logos/AFMS2.png" 
          alt="AFMS Logo" 
          style={{ 
            marginLeft: 16,
            marginBottom: 16,
            width: '145px', 
            filter: 'drop-shadow(0 0 8px rgba(255,68,68,0.5))' 
          }} 
          />
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex',
          gap: 1,
          mb: 4,
          filter: 'drop-shadow(0 0 8px rgba(255,68,68,0.3))',
          '&:hover img': {
            transform: 'scale(1.05)',
            transition: 'transform 0.3s ease'
          }
        }}>
          <img 
            src="/images/1.jpg" 
            alt="Military Badge 1" 
            style={{ 
              width: '250px',
              height: 'auto',
              borderRadius: '8px'
            }} 
          />
          <img 
            src="/images/2.jpg" 
            alt="Military Badge 2" 
            style={{ 
                  width: '250px',
              height: 'auto',
              borderRadius: '8px'
            }} 
          />
          <img 
            src="/images/3.jpg" 
            alt="Military Badge 3" 
            style={{ 
              width: '250px',
              height: 'auto',
              borderRadius: '8px'
            }} 
          />
          <img 
            src="/images/4.jpg" 
            alt="Military Badge 4" 
            style={{ 
              width: '250px',
              height: 'auto',
              borderRadius: '8px'
            }} 
          />
        </Box>
        <Paper elevation={3} sx={{ 
          p: 4, 
          display: 'flex',
          flexDirection: 'column',  
          alignItems: 'center',
          width: '50%',
          background: 'linear-gradient(145deg, rgba(34, 1, 1, 0.3) 0%, rgba(0,0,0,0.6) 100%)',
          border: '1px solid rgba(255,68,68,0.2)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(255,68,68,0.1)'
        }}>
       
          <Typography 
            component="h1" 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ 
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255,68,68,0.5)',
              letterSpacing: '1.5px',
              mb: 4
            }}
          >
        ADMIN ACCESS
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              id="username"
              name="username"
              label="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#8b0000' },
                  '&:hover fieldset': { borderColor: '#ff4444' },
                  '&.Mui-focused fieldset': { borderColor: '#ff4444' }
                },
                '& .MuiInputLabel-root': { color: '#cccccc' }
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#8b0000' },
                  '&:hover fieldset': { borderColor: '#ff4444' },
                  '&.Mui-focused fieldset': { borderColor: '#ff4444' }
                },
                '& .MuiInputLabel-root': { color: '#cccccc' }
              }}
            />
            {error && (
              <Typography color="error" align="center" sx={{ 
                mt: 2, 
                color: '#ff4444',
                textShadow: '0 0 8px rgba(255,68,68,0.3)'
              }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #8b0000 30%, #400000 90%)',
                fontWeight: 'bold',
                letterSpacing: '1.5px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #400000 30%, #8b0000 90%)',
                  boxShadow: '0 4px 15px rgba(255,68,68,0.3)'
                }
              }}
            >
              SECURE SIGN IN
            </Button>
          </form>
        </Paper>
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 2, 
            color: '#666666',
            textAlign: 'center',
            '&:hover': { color: '#ff4444' }
          }}
        >
          INDIAN ARMED FORCES MEDICAL SERVICES
        </Typography>
      </Box>
    </Box>
  );
}