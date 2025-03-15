import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getClientsWithAlerts } from '../services/analysisApi';
import { format } from 'date-fns';
const alert_value = {
    'heart_rate':{value:100,sign:'>'},
    'sbp':{value:140,sign:'>'},
    'dbp':{value:100,sign:'>'},
    'spo2':{value:90,sign:'<'},
    'temp_f':{value:100,sign:'>'},
    'hb':{value:10,sign:'<'},
    'wbc':{value:11,sign:'>'},
    'plt':{value:1,sign:'<'},
    'fbs':{value:100,sign:'>'},
    'ppbs':{value:140,sign:'>'},
    'hba1c':{value:6.20,sign:'>'},
    't_choles':{value:200,sign:'>'},
    'hdl':{value:40,sign:'<'},
    'ldl':{value:100,sign:'>'},
    't_bilirubin':{value:1.2,sign:'>'},
    'sr_creatinine':{value:1.4,sign:'>'},
    't_protein':{value:6.0,sign:'<'},
    'sr_albumin':{value:3.5,sign:'<'},
    'sr_globulin':{value:2.0,sign:'<'}
    
  }
const alertConfig = {
  hb: { displayName: 'Hemoglobin', sign: '<', limit: 10, unit: 'g/dL' },
  heart_rate: { displayName: 'Heart Rate', sign: '>', limit: alert_value.heart_rate.value, unit: 'bpm' },
  ppbs: { displayName: 'Postprandial Blood Sugar', sign: '>', limit: alert_value.ppbs.value, unit: 'mg/dL' },
  fbs: { displayName: 'Fasting Blood Sugar', sign: '>', limit: alert_value.fbs.value, unit: 'mg/dL' },
  wbc: { displayName: 'White Blood Cells', sign: '>', limit: alert_value.wbc.value, unit: '10^3/μL' },
  ldl: { displayName: 'LDL Cholesterol', sign: '>', limit: alert_value.ldl.value, unit: 'mg/dL' },
  t_bilirubin: { displayName: 'Total Bilirubin', sign: '>', limit: alert_value.t_bilirubin.value, unit: 'mg/dL' },
  hba1c: { displayName: 'HbA1c', sign: '>', limit: alert_value.hba1c.value, unit: '%' },
  sr_globulin: { displayName: 'Serum Globulin', sign: '<', limit: alert_value.sr_globulin.value, unit: 'g/dL' },
  hdl: { displayName: 'HDL Cholesterol', sign: '<', limit: alert_value.hdl.value, unit: 'mg/dL' },
  sr_creatinine: { displayName: 'Serum Creatinine', sign: '>', limit: alert_value.sr_creatinine.value, unit: 'mg/dL' }
};

const Alerts = () => {
  const navigate = useNavigate();
  const [alertsData, setAlertsData] = useState({});
  const [orderBy, setOrderBy] = useState('army_id');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getClientsWithAlerts();
        setAlertsData(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };
    fetchAlerts();
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortData = (data) => {
    return data.sort((a, b) => {
      if (orderBy === 'dob') {
        const dateA = new Date(a[orderBy]);
        const dateB = new Date(b[orderBy]);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return order === 'asc' 
        ? a[orderBy]?.localeCompare(b[orderBy]) 
        : b[orderBy]?.localeCompare(a[orderBy]);
    });
  };

  return (
    <Container maxWidth="lg" sx={{ 
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
      minHeight: '100vh',
      py: 4,
      color: '#ffffff'
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        textShadow: '0 0 10px rgba(255,68,68,0.5)',
        mb: 4,
        letterSpacing: '1.5px'
      }}>
        Health Alerts Dashboard
      </Typography>

      {Object.keys(alertsData).length === 0 ? (
        <Paper sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(145deg, rgba(64,0,0,0.3) 0%, rgba(0,0,0,0.3) 100%)',
          border: '1px solid rgba(255,68,68,0.2)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(255,68,68,0.1)'
        }}>
          <Typography variant="h5" sx={{ 
            color: '#ff4444',
            textShadow: '0 0 8px rgba(255,68,68,0.3)',
            mb: 2
          }}>
            No Health Alerts!
          </Typography>
          <Typography variant="body1" sx={{ color: '#ffffff99' }}>
            All vital signs and metrics are within normal ranges
          </Typography>
        </Paper>
      ) : (
        Object.entries(alertsData).map(([category, clients]) => {
          const config = alertConfig[category] || {};
          return (
            <Box key={category} sx={{ mb: 4 }}>
              <Paper sx={{
                p: 2,
                background: 'linear-gradient(145deg, rgba(64,0,0,0.3) 0%, rgba(0,0,0,0.3) 100%)',
                border: '1px solid rgba(255,68,68,0.2)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(255,68,68,0.1)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ff4444',
                    textShadow: '0 0 8px rgba(255,68,68,0.3)'
                  }}>
                    {config.displayName}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#ffffff99' }}>
                    Threshold: {config.sign} {config.limit} {config.unit}
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        background: 'linear-gradient(145deg, #400000 0%, #000000 100%)',
                        '& th': { borderBottom: '2px solid rgba(255,68,68,0.2)' }
                      }}>
                        {['army_id', 'name', 'dob', 'gender', 'status'].map((column) => (
                          <TableCell key={column} sx={{ color: '#ffffff' }}>
                            <TableSortLabel
                              active={orderBy === column}
                              direction={orderBy === column ? order : 'asc'}
                              onClick={() => handleRequestSort(column)}
                              sx={{
                                color: '#ffffff',
                                '&:hover': { color: '#ff4444' },
                                '&.Mui-active': { color: '#ff4444' }
                              }}
                            >
                              {column.split('_').join(' ').toUpperCase()}
                            </TableSortLabel>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortData(clients).map((client) => (
                        <TableRow key={client.id} 
                        onClick={()=>navigate(`/admin-panel/personnel/${client.id}/`)}
                        hover sx={{ 
                          '&:hover': { background: 'rgba(255,68,68,0.05)' },
                          '& td': { 
                            color: '#ffffff',
                            borderBottom: '1px solid rgba(255,68,68,0.1)' 
                          }
                        }}>
                          <TableCell>{client.army_id}</TableCell>
                          <TableCell>{client.name}</TableCell>
                          <TableCell>
                            {format(new Date(client.dob), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>{client.gender}</TableCell>
                          <TableCell>
                            <Chip
                              label={client.status}
                              color="error"
                              size="small"
                              sx={{
                                fontWeight: 600,
                                textShadow: '0 0 4px rgba(255,68,68,0.3)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          );
        })
      )}
    </Container>
  );
};

export default Alerts;
