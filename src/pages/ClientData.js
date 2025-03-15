import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Snackbar,
  Alert,
  Modal
} from '@mui/material';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ArrowBack, Lock } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getDataTypes, recordClientData, updateClientDetails, getClientById, fetchDataByDate, changeClientPassword, deleteClient } from '../services/api';
import { getClientsWithAlerts } from '../services/analysisApi';

const groupByCategory = (dataTypes) => {
  const groupedDataTypes = dataTypes.reduce((acc, type) => {
    const category = type.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(type);
    return acc;
  }, {});
  return groupedDataTypes;
};

const ClientData = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [dataTypes, setDataTypes] = useState([]);
  const [lastData, setLastData] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [values, setValues] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [groupedDataTypes, setGroupedDataTypes] = useState({});
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [openAdminPasswordModal, setOpenAdminPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [countdown, setCountdown] = useState(2);

  const clientDetailFields = [
    { id: 'army_id', label: 'Army ID', required: true },
    { id: 'name', label: 'Name', required: true },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
    { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
    { id: 'status', label: 'Status', type: 'select', options: ['Active', 'Retired', 'Reserved'], required: true }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, typesRes] = await Promise.all([
          getClientById(clientId),
          getDataTypes()
        ]);
        
        setSelectedClient(clientRes);
        setDataTypes(typesRes);
        setGroupedDataTypes(groupByCategory(typesRes));
        setLoading(false);
        fetchDataByDate(clientId, selectedDate);
      } catch (error) {
        console.error('Error loading data:', error);
        setToast({ open: true, message: 'Failed to load data', type: 'error' });
        navigate('/admin-panel/personnel');
      }
    };

    if (clientId) {
      fetchData();
      fetchLastData(clientId, selectedDate);
    }
  }, [clientId]);

  const fetchLastData = async (clientId, date) => {
    try {
      const response = await fetchDataByDate(clientId, format(date, 'yyyy-MM-dd'));
      setLastData(response);

      const prefilledValues = {};
      Object.entries(response).forEach(([id, data]) => {
        prefilledValues[data.data_type_id] = {
          value: data.value,
          notes: data.notes || ''
        };
      });
      setValues(prefilledValues);
    } catch (error) {
      console.error('Error fetching last data:', error);
      setLastData({});
      setValues({});
    }
  };

  const getFieldType = (dataType) => {
    const selectFields = {
      smoking: ['Daily', 'Weekly', 'Occasionally', 'Never'],
      alcohol_intake: ['Daily', 'Weekly', 'Occasionally', 'Never'],
      phy_activity: ['Daily', 'Weekly', 'Occasionally', 'Never'],
      family_h_o_dm: ['True', 'False'],
      family_h_o_heart_disease: ['True', 'False']
    };

    if (selectFields[dataType.name]) {
      return { type: 'select', options: selectFields[dataType.name] };
    }
    return dataType.unit ? { type: 'number' } : { type: 'text' };
  };

  const handleValueChange = (dataTypeId, value, dataType) => {
    setValues(prev => ({
      ...prev,
      [dataType.id]: {
        ...prev[dataType.id],
        value: value
      }
    }));
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchLastData(clientId, newDate);
  };

  const handleSaveAllData = async () => {
    try {
      setSaving(prev => ({ ...prev, all: true }));
      
      // Create entries for ALL data types, using empty string for untouched fields
      const dataEntries = dataTypes.map(dataType => {
        const existingValue = values[dataType.id]?.value;
        return {
          data_type_id: dataType.id,
          value: existingValue !== undefined && existingValue !== '' ? existingValue : '',
          notes: values[dataType.id]?.notes || '',
          recorded_at: format(selectedDate, 'yyyy-MM-dd')
        };
      });

      await recordClientData(clientId, { dataEntries });
      setToast({ open: true, message: 'Measurements saved successfully', type: 'success' });
      fetchLastData(clientId, selectedDate);
    } catch (error) {
      setToast({ open: true, message: 'Failed to save measurements', type: 'error' });
    } finally {
      setSaving(prev => ({ ...prev, all: false }));
    }
  };

  const handleClientDetailChange = (field, value) => {
    setSelectedClient(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveClientDetails = async () => {
    try {
      setSaving(prev => ({ ...prev, details: true }));
      await updateClientDetails(clientId, selectedClient);
      setToast({ open: true, message: 'Personal details updated', type: 'success' });
    } catch (error) {
      setToast({ open: true, message: 'Failed to update details', type: 'error' });
    } finally {
      setSaving(prev => ({ ...prev, details: false }));
    }
  };

  const handleAdminPasswordSubmit = async () => {
    try {
      await changeClientPassword(clientId, { password: newPassword });
      setOpenAdminPasswordModal(false);
      setNewPassword('');
      setToast({ open: true, message: 'Password changed successfully', type: 'success' });
    } catch (error) {
      setToast({ open: true, message: error.response?.data?.message || 'Failed to change password', type: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #0a0a0a 0%, #000 100%)',
        color: '#fff'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ 
            color: '#ff4444',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round'
            }
          }} />
          <Typography variant="h6" sx={{ mt: 2, color: '#ff4444', letterSpacing: '1.5px' }}>
            Loading Personnel Data...
          </Typography>
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ 
      p: 6, 
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #0a0a0a 0%, #000 100%)',
      color: '#ffffff'
    }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}> 
          <IconButton 
            onClick={() => navigate('/admin-panel/personnel')} 
          sx={{ 
            color: '#ff4444',
            '&:hover': { background: 'rgba(255,68,68,0.1)' }
          }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ 
          color: '#ffffff',
          pl: 3,
          textShadow: '0 0 8px rgba(255,68,68,0.3)',
          letterSpacing: '1.5px'
        }}>
          {selectedClient.name} <br/>({selectedClient.army_id})
        </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Lock />}
            onClick={() => setOpenAdminPasswordModal(true)}
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
            Change Password
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/admin-panel/personnel/${clientId}/analysis`)}
            disabled={saving.all}
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
            View Analysis
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenDeleteModal(true);
              setCountdown(3);
              const interval = setInterval(() => {
                setCountdown(prev => {
                  if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
            }}
            sx={{
              borderColor: '#ff4444',
              color: '#ff4444',
              '&:hover': {
                borderColor: '#cc0000',
                backgroundColor: 'rgba(255,68,68,0.1)'
              }
            }}
          >
            Delete Client
          </Button>
        </Box>
      </Box>

      {/* Personal Details Section */}
      <Paper sx={{ 
        p: 3, 
        mb: 4,
        background: 'linear-gradient(145deg, rgba(64,0,0,0.3) 0%, rgba(0,0,0,0.3) 100%)',
        border: '1px solid rgba(255,68,68,0.2)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(255,68,68,0.1)'
      }}>
        <Typography variant="h5" sx={{ 
          color: '#ffffff',
          pb: 1,
          mb: 3,
          borderBottom: '2px solid rgba(255,68,68,0.3)',
          textShadow: '0 0 8px rgba(255,68,68,0.2)'
        }}>
          Personal Details
        </Typography>

        <Grid container spacing={3}>
          {clientDetailFields.map((field) => (
            <Grid item xs={12} md={4} key={field.id}>
              {field.type === 'select' ? (
                <TextField
                  select
                  fullWidth
                  label={field.label}
                  value={selectedClient[field.id] || ''}
                  onChange={(e) => handleClientDetailChange(field.id, e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#ffffff' },
                      '&:hover fieldset': { borderColor: '#ff4444' },
                    },
                    '& .MuiInputLabel-root': { color: '#ffffff' }
                  }}
                >
                  {field.options.map(option => (
                    <MenuItem key={option} value={option} sx={{ 
                      background: '#1a1a1a', 
                      '&:hover': { background: '#2a2a2a' },
                      color: '#ffffff'
                    }}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ) : field.type === 'date' ? (
                <DatePicker
                  label={field.label}
                  value={new Date(selectedClient.dob)}
                  onChange={(date) => handleClientDetailChange('dob', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#ffffff',
                          '& fieldset': { borderColor: '#ffffff' },
                          '&:hover fieldset': { borderColor: '#ff4444' },
                        },
                        '& .MuiInputLabel-root': { color: '#ffffff' }
                      }}
                    />
                  )}
                />
              ) : (
                <TextField
                  fullWidth
                  label={field.label}
                  value={selectedClient[field.id] || ''}
                  onChange={(e) => handleClientDetailChange(field.id, e.target.value)}
                  required={field.required}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#ffffff' },
                      '&:hover fieldset': { borderColor: '#ff4444' },

                    },
                    '& .MuiInputLabel-root': { color: '#ff4444' }
                  }}
                />
              )}
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSaveClientDetails}
              disabled={saving.details}
              sx={{
                background: 'linear-gradient(45deg, #ff4444 30%, #cc0000 90%)',
                '&:hover': { 
                  background: 'linear-gradient(45deg, #ff6666 30%, #ff4444 90%)',
                  boxShadow: '0 0 8px rgba(255,68,68,0.4)'
                },
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              {saving.details ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Save Details'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Measurements Section */}
      <Paper sx={{ 
        p: 3,
        background: 'linear-gradient(145deg, rgba(64,0,0,0.3) 0%, rgba(0,0,0,0.3) 100%)',
        border: '1px solid rgba(255,68,68,0.2)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(255,68,68,0.1)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h5" sx={{ 
            color: '#ffffff',
            textShadow: '0 0 8px rgba(255,68,68,0.2)'
          }}>
            Health Measurements
          </Typography>
          <DatePicker
            label="Measurement Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{ 
                  width: 250,
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: '#ffffff' },
                    '&:hover fieldset': { borderColor: '#ff4444' },
                  },
                  '& .MuiInputLabel-root': { color: '#ffffff' }
                }}
              />
            )}
          />
        </Box>

        <Grid container spacing={3}>
          {Object.entries(groupedDataTypes).map(([category, types]) => (
            <Grid item xs={12} md={6} key={category}>
              <Paper sx={{ 
                p: 2, 
                background: 'linear-gradient(145deg, rgba(64,0,0,0.3) 0%, rgba(0,0,0,0.3) 100%)',
                border: '1px solid rgba(255,68,68,0.2)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(255,68,68,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#ffffff',
                  mb: 2,
                  borderBottom: '2px solid rgba(255,68,68,0.3)',
                  pb: 1,
                  textShadow: '0 0 8px rgba(255,68,68,0.2)'
                }}>

                  {category}
                </Typography>
                
                {types.map((type) => {
                  const fieldType = getFieldType(type);
                  return (
                    <Box key={type.id} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#ffffff' }}>
                        {type.display_name} {type.unit && `(${type.unit})`}
                      </Typography>
                      <TextField
                        fullWidth
                        value={values[type.id]?.value || ''}
                        onChange={(e) => handleValueChange(type.id, e.target.value, type)}
                        type={fieldType.type}
                        select={fieldType.type === 'select'}
                        inputProps={fieldType.type === 'number' ? { step: '0.1' } : {}}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#ffffff',
                            '& fieldset': { borderColor: '#ffffff' },
                            '&:hover fieldset': { borderColor: '#ff4444' },
                          },
                          '& .MuiInputLabel-root': { color: '#ffffff' }
                        }}
                      >
                        {fieldType.options?.map(option => (
                          <MenuItem key={option} value={option} sx={{ 
                            background: '#1a1a1a', 
                            '&:hover': { background: '#2a2a2a' },
                            color: '#ffffff'
                          }}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  );
                })}
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button
            variant="contained"
            onClick={handleSaveAllData}
            disabled={saving.all}
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
            {saving.all ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Save All Measurements'}
          </Button>
        </Box>
      </Paper>

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast(p => ({ ...p, open: false }))}>
        <Alert 
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

      <Modal
        open={openAdminPasswordModal}
        onClose={() => setOpenAdminPasswordModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          background: 'linear-gradient(195deg, #1a1a1a 0%, #000000 100%)',
          p: 3,
          borderRadius: 2,
          width: 400,
          boxShadow: 24
        }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Change Client Password
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="New Password"
            variant="outlined"
            sx={{ mb: 3 }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{ sx: { color: '#fff' } }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAdminPasswordSubmit}
              sx={{ 
                background: '#ff4444',
                '&:hover': { background: '#cc0000' }
              }}
            >
              Submit
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenAdminPasswordModal(false)}
              sx={{ color: '#fff', borderColor: '#fff' }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setCountdown(2);
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          background: 'linear-gradient(195deg, #1a1a1a 0%, #000000 100%)',
          p: 3,
          borderRadius: 2,
          width: 400,
          boxShadow: 24
        }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Confirm Delete
          </Typography>
          <Typography variant="body1" sx={{ color: '#fff', mb: 3 }}>
            Deleting this client will remove all their data. Confirm in {countdown} seconds...
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
                setCountdown(2);
              }}
              sx={{ color: '#fff', borderColor: '#fff' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={countdown > 0}
              onClick={async () => {
                try {
                  await deleteClient(clientId);
                  navigate('/admin-panel/personnel');
                } catch (error) {
                  setToast({ open: true, message: 'Failed to delete client', type: 'error' });
                }
              }}
              sx={{ 
                background: '#ff4444',
                '&:hover': { background: '#cc0000' },
                '&:disabled': { background: '#666666' }
              }}
            >
              Confirm Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ClientData;