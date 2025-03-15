import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { createClient } from '../services/api';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DialogActions from '@mui/material/DialogActions';
import { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function CreateClient({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    army_id: '',
    name: '',
    date_of_birth: null,
    gender: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success'
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.army_id) newErrors.army_id = 'Army ID is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of Birth is required';
    if (formData.date_of_birth > new Date()) newErrors.date_of_birth = 'Date of Birth cannot be in the future';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password should be of minimum 8 characters length';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    console.log('Validation errors:', newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log('Form data:', formData);

    setIsSubmitting(true);
    try {
      const formattedValues = {
        ...formData,
        date_of_birth: formData.date_of_birth.toISOString().split('T')[0]
      };
      
      console.log('Submitting form data:', formattedValues);
      const response = await createClient(formattedValues);
      console.log('Server response:', response);
      
      setToast({
        open: true,
        message: 'Personnel created successfully!',
        type: 'success'
      });
      
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
      
    } catch (error) {
      console.error('Error creating client:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create personnel. Please try again.';
      setToast({
        open: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onCancel) onCancel();
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ 
          p: 4,
          background: 'linear-gradient(145deg, rgba(64,0,0,0.3) 0%, rgba(0,0,0,0.3) 100%)',
          borderRadius: '16px',
        }}>
          <Typography variant="h4" sx={{ 
            mb: 4, 
            color: '#ffffff',
            textShadow: '0 0 8px rgba(255,68,68,0.3)',
            letterSpacing: '1.5px'
          }}>
            Create New Personnel
          </Typography>
          
          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="army_id"
                  name="army_id"
                  label="Army ID"
                  value={formData.army_id}
                  onChange={handleChange}
                  error={Boolean(errors.army_id)}
                  helperText={errors.army_id}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#ffffff' },
                      '&:hover fieldset': { borderColor: '#ff4444' },
                    },
                    '& .MuiInputLabel-root': { color: '#ffffff' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#ffffff' },
                      '&:hover fieldset': { borderColor: '#ff4444' },
                    },
                    '& .MuiInputLabel-root': { color: '#ffffff' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date of Birth"
                  disableFuture
                  maxDate={new Date(new Date().getFullYear() - 17,0,1)}
                  value={formData.date_of_birth}
                  onChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      date_of_birth: value
                    }));
                    if (errors.date_of_birth) {
                      setErrors(prev => ({
                        ...prev,
                        date_of_birth: ''
                      }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={Boolean(errors.date_of_birth)}
                      helperText={errors.date_of_birth}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#ffffff',
                          '& fieldset': { borderColor: '#ff4444' },
                        },
                        '& .MuiInputLabel-root': { color: '#ff8888' }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="gender"
                  name="gender"
                  select
                  label="Gender"
                  value={formData.gender}
                  onChange={handleChange}
                  error={Boolean(errors.gender)}
                  helperText={errors.gender}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#ff4444' },
                    },
                    '& .MuiInputLabel-root': { color: '#ff8888' }
                  }}
                >
                  {['Male', 'Female', 'Other'].map((option) => (
                    <MenuItem 
                      key={option} 
                      value={option}
                      sx={{ 
                        background: '#1a1a1a', 
                        '&:hover': { background: '#2a2a2a' },
                        color: '#ffffff'
                      }}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#ff4444' },
                      '&:hover fieldset': { borderColor: '#ff6666' },
                    },
                    '& .MuiInputLabel-root': { color: '#ff8888' }
                  }}
                />
              </Grid>
            </Grid>

            <DialogActions sx={{ mt: 4 }}>
              <Button 
                onClick={handleClose}
                disabled={isSubmitting}
                color="error"
                type="button"
                sx={{
                  color: '#ff4444',
                  '&:hover': {
                    background: 'rgba(255,68,68,0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                disabled={isSubmitting}
                sx={{
                  background: 'linear-gradient(45deg, #ff4444 30%, #cc0000 90%)',
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #cc0000 30%, #cc0000 90%)',
                    boxShadow: '0 0 8px rgba(255,68,68,0.4)'
                  },
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} /> 
                ) : 'Create Personnel'}
              </Button>
            </DialogActions>
          </form>
        </Paper>
      </Container>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.type}
          sx={{ 
            bgcolor: toast.type === 'success' ? '#2d0000' : '#4d0000',
            color: '#ff4444',
            border: '1px solid #ff4444',
            borderRadius: '8px',
            boxShadow: '0 0 12px rgba(255,68,68,0.2)'
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
} 