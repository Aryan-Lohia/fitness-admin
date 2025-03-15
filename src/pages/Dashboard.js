import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  People,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import { getDashboardStats, getAllClients } from '../services/api';
import { format } from 'date-fns';
import React from 'react';
import { getClientsWithAlerts } from '../services/analysisApi';
import WarningIcon from '@mui/icons-material/Warning';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AirIcon from '@mui/icons-material/Air';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BiotechIcon from '@mui/icons-material/Biotech';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';  
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import OpacityIcon from '@mui/icons-material/Opacity';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ScienceIcon from '@mui/icons-material/Science';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';



const StatCard = ({ title, value, icon, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      background: 'linear-gradient(145deg, rgba(64,0,0,0.4) 0%, rgba(0,0,0,0.3) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      color: '#ffffff',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: (theme) => `0 8px 24px ${theme.palette.error.main}33`
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {React.cloneElement(icon, { sx: { filter: 'drop-shadow(0 0 4px rgba(255,68,68,0.3))' } })}
      <Typography component="h2" variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
    <Typography component="p" variant="h4" sx={{ textShadow: '0 0 10px rgba(255,68,68,0.3)' }}>
      {value}
    </Typography>
  </Paper>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalAssessments: 0,
  });
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('army_id');
  const [order, setOrder] = useState('asc');
  const [alertsData, setAlertsData] = useState({});

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortData = (data) => {
    return data.sort((a, b) => {
      if (orderBy === 'dob' || orderBy === 'last_assessment_date') {
        const dateA = new Date(a[orderBy] || '1900-01-01');
        const dateB = new Date(b[orderBy] || '1900-01-01');
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, clientsResponse, alertsResponse] = await Promise.all([
          getDashboardStats(),
          getAllClients(),
          getClientsWithAlerts()
        ]);
        setStats(statsResponse);
        setClients(clientsResponse.clients);
        setAlertsData(alertsResponse);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const SortLabel = ({ property, label }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: '16px',
          '&:hover': {
            opacity: 0.8,
          },
        }}
        onClick={() => handleRequestSort(property)}
      >
        {label}
        {orderBy === property && (
          <Box component="span" sx={{ ml: 0.5 }}>
            {order === 'asc' ? '↑' : '↓'}
          </Box>
        )}
      </Box>
    );
  };

  const alertCounts = {
    cardiac: Object.values(alertsData).flatMap(arr => arr).filter(c => 
      ['heart_rate', 'sbp', 'dbp', 'spo2', 'temp_f','t_choles','hb','wbc','plt','fbs','ppbs','hba1c','t_bilirubin','sr_creatinine','t_protein','sr_albumin','sr_globulin'].some(a => alertsData[a]?.includes(c))
    ).length,
    heart_rate: alertsData.heart_rate?.length || 0,
    sbp: alertsData.sbp?.length || 0,
    dbp: alertsData.dbp?.length || 0,
    spo2: alertsData.spo2?.length || 0,
    temp_f: alertsData.temp_f?.length || 0,
    hb: alertsData.hb?.length || 0,
    wbc: alertsData.wbc?.length || 0,
    plt: alertsData.plt?.length || 0,
    fbs: alertsData.fbs?.length || 0,
    ppbs: alertsData.ppbs?.length || 0,
    hba1c: alertsData.hba1c?.length || 0,
    t_choles: alertsData.t_choles?.length || 0,
    hdl: alertsData.hdl?.length || 0,
    ldl: alertsData.ldl?.length || 0,
    t_bilirubin: alertsData.t_bilirubin?.length || 0,
    sr_creatinine: alertsData.sr_creatinine?.length || 0,
    t_protein: alertsData.t_protein?.length || 0,
    sr_albumin: alertsData.sr_albumin?.length || 0,
    sr_globulin: alertsData.sr_globulin?.length || 0,
  
  };
  // const alert_value = {
  //   'heart_rate':{value:100,sign:'>'},
  //   'sbp':{value:140,sign:'>'},
  //   'dbp':{value:100,sign:'>'},
  //   'spo2':{value:90,sign:'<'},
  //   'temp_f':{value:100,sign:'>'},
  //   'hb':{value:10,sign:'<'},
  //   'wbc':{value:11,sign:'>'},
  //   'plt':{value:1,sign:'<'},
  //   'fbs':{value:100,sign:'>'},
  //   'ppbs':{value:140,sign:'>'},
  //   'hba1c':{value:6.20,sign:'>'},
  //   't_choles':{value:200,sign:'>'},
  //   'hdl':{value:40,sign:'<'},
  //   'ldl':{value:100,sign:'>'},
  //   't_bilirubin':{value:1.2,sign:'>'},
  //   'sr_creatinine':{value:1.4,sign:'>'},
  //   't_protein':{value:6.0,sign:'<'},
  //   'sr_albumin':{value:3.5,sign:'<'},
  //   'sr_globulin':{value:2.0,sign:'<'}
    
  // }
  const colorPalette = {
    background: '#000000',
    cardBg: 'linear-gradient(to bottom right, #1a1a1a 0%, #0a0a0a 100%)',
    text: '#FFFFFF',
    textSecondary: '#A6A7AB',
    purple: '#7B4BFF',
    blue: '#4DABF7',
    green: '#69DB7C',
    orange: '#FF9F1C',
    red: '#FF1B1B',
    pink: '#F06595',
    yellow: '#FFD700',
  };
  const alertTypes = [
    {
      title:"Heart Rate",
      value:alertCounts.heart_rate,
      color:colorPalette.orange,
      icon:<MonitorHeartIcon sx={{ color: colorPalette.orange }} />,
      category:'heart_rate',
    },
    {
      title:"SBP",
      value:alertCounts.sbp,
      color:colorPalette.green,
      icon:<WarningIcon sx={{ color: colorPalette.green }} />,
      category:'sbp',
    },
    {
      title:"DBP", 
      value:alertCounts.dbp,
      color:colorPalette.pink,
      icon:<FavoriteIcon sx={{ color: colorPalette.pink }} />,
      category:'dbp'
    },
    {
      title:"SPO2",
      value:alertCounts.spo2,
      color:colorPalette.blue,
      icon:<AirIcon sx={{ color: colorPalette.blue }} />,
      category:'spo2'
    },
    {
      title:"Temperature",
      value:alertCounts.temp_f,
      color:colorPalette.red,
      icon:<DeviceThermostatIcon sx={{ color: colorPalette.red }} />,
      category:'temp_f'
    },
    {
      title:"Hemoglobin",
      value:alertCounts.hb,
      color:colorPalette.purple,
      icon:<WaterDropIcon sx={{ color: colorPalette.purple }} />,
      category:'hb'
    },
    {
      title:"White Blood Cells",
      value:alertCounts.wbc,
      color:colorPalette.blue,
      icon:<BiotechIcon sx={{ color: colorPalette.blue }} />,
      category:'wbc'
    },
    {
      title:"Platelets",
      value:alertCounts.plt,
      color:colorPalette.red,
      icon:<BloodtypeIcon sx={{ color: colorPalette.red }} />,
      category:'plt'
    },
    {
      title:"Fasting Blood Sugar",
      value:alertCounts.fbs,
      color:colorPalette.blue,
      icon:<LocalHospitalIcon sx={{ color: colorPalette.blue }} />,
      category:'fbs'
    },
    {
      title:"P Blood Sugar",
      value:alertCounts.ppbs,
      color:colorPalette.green,
      icon:<TimelineIcon sx={{ color: colorPalette.green }} />,
      category:'ppbs'
    },
    {
      title:"HbA1c",
      value:alertCounts.hba1c,
      color:colorPalette.red,
      icon:<AssessmentIcon sx={{ color: colorPalette.red }} />,
      category:'hba1c'
    },
    {
      title:"Total Cholesterol",
      value:alertCounts.t_choles,
      color:colorPalette.orange,
      icon:<OpacityIcon sx={{ color: colorPalette.orange }} />,
      category:'t_choles'
    },
    {
      title:"HDL Cholesterol",
      value:alertCounts.hdl,
      color:colorPalette.pink,
      icon:<TrendingUpIcon sx={{ color: colorPalette.pink }} />,
      category:'hdl'
    },
    {
      title:"LDL Cholesterol",
      value:alertCounts.ldl,
      color:colorPalette.yellow,
      icon:<TrendingDownIcon sx={{ color: colorPalette.yellow }} />,
      category:'ldl'
    },
    {
      title:"Total Bilirubin",
      value:alertCounts.t_bilirubin,
      color:colorPalette.blue,
      icon:<ScienceIcon sx={{ color: colorPalette.blue }} />,
      category:'t_bilirubin'
    },
    {
      title:"Serum Creatinine",
      value:alertCounts.sr_creatinine,
      color:colorPalette.green,
      icon:<FilterAltIcon sx={{ color: colorPalette.green }} />,
      category:'sr_creatinine'
    },
    {
      title:"Total Protein",
      value:alertCounts.t_protein,
      color:colorPalette.red,
      icon:<BarChartIcon sx={{ color: colorPalette.red }} />,
      category:'t_protein'
    },
    {
      title:"Serum Albumin",
      value:alertCounts.sr_albumin,
      color:colorPalette.pink,
      icon:<ShowChartIcon sx={{ color: colorPalette.pink }} />,
      category:'sr_albumin'
    },
    {
      title:"Serum Globulin",
      value:alertCounts.sr_globulin,
      color:colorPalette.orange,
      icon:<PieChartIcon sx={{ color: colorPalette.orange }} />,
      category:'sr_globulin'
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ 
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#ffffff',
        textShadow: '0 0 10px rgba(255,68,68,0.5)',
        mb: 4,
        letterSpacing: '1.5px'
      }}>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<People color="white" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Active Clients"
            value={stats.activeClients}
            icon={<TrendingUp color="white" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Assessments"
            value={stats.totalAssessments}
            icon={<Assessment color="white" />}
          />
        </Grid>
      </Grid>

      {/* Alert Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <Paper elevation={0} sx={{ 
          p: 2,
          width: '100%', 
          mb: 4,
          background: 'linear-gradient(145deg, rgba(64,0,0,0.3) 0%, rgba(0,0,0,0.3) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
        }}>
        <Typography variant="h6" sx={{ 
          color: '#ffffff',
          textShadow: '0 0 10px rgba(255,68,68,0.5)',
          mb: 2,
          letterSpacing: '1.5px'
        }}>
          Alert Statistics
        </Typography>
      
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {alertTypes.map((alert) => (

          alert.value>0 && <Grid item xs={12} md={3} key={alert.title}>
             <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 2,
                        mb: 2,
                        width: '100%',
                        borderRadius: 2,
                        bgcolor: 'transparent',
                        border: `1px solid ${alert.color}`
                      }}
                      onClick={() => navigate('/admin-panel/alerts')}

                      >
                        
                        {alert.icon}
                          {alert.title}
                        <Typography variant="h6" sx={{ color: '#ffffff' }}>
                          {alert.value}
                        </Typography>
                      </Box>
          </Grid>
        ))}
      </Grid>
      </Paper>
      </Box>
      {/* Clients Table */}
      <Paper elevation={0} sx={{ 
        width: '100%', 
        mb: 4,
        background: 'linear-gradient(145deg, rgba(64,0,0,0.3) 0%, rgba(0,0,0,0.3) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,68,68,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <Typography variant="h6" sx={{ 
          p: 2, 
          color: '#ffffff',
          borderBottom: '1px solid rgba(255,68,68,0.1)'
        }}>
          Assessment History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(145deg, #400000 0%, #000000 100%)',
                '& th': {
                  borderBottom: '2px solid rgba(255,68,68,0.2)'
                }
              }}
              
              >
                <TableCell sx={{ color: '#ffffff' }}>
                  <SortLabel property="army_id" label="Army ID" />
                </TableCell>
                <TableCell sx={{ color: '#ffffff' }}>
                  <SortLabel property="name" label="Name" />
                </TableCell>
                <TableCell sx={{ color: '#ffffff' }}>
                  <SortLabel property="dob" label="DOB" />
                </TableCell>
                <TableCell sx={{ color: '#ffffff' }}>
                  <SortLabel property="gender" label="Gender" />
                </TableCell>
                <TableCell sx={{ color: '#ffffff' }}>
                  <SortLabel property="is_active" label="Status" />
                </TableCell>
                <TableCell sx={{ color: '#ffffff' }}>
                  <SortLabel property="last_assessment_date" label="Last Assessment" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortData(clients)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                  <TableRow 
                    key={client.id}
                    onClick={() => navigate(`/admin-panel/personnel/${client.id}/`)}
                    sx={{
                      '&:hover': {
                        background: 'rgba(255,68,68,0.05)'
                      },
                      '& td': {
                        color: '#ffffff',
                        borderBottom: '1px solid rgba(255,68,68,0.1)'
                      }
                    }}
                  >
                    <TableCell>{client.army_id}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{format(new Date(client.dob), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{client.gender}</TableCell>
                    <TableCell>
                      <Chip 
                        label={client.is_active ? "Active" : "Inactive"}
                        color={client.is_active ? "error" : "default"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          textShadow: '0 0 4px rgba(255,68,68,0.3)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {client.last_assessment_date 
                        ? new Date(client.last_assessment_date).toLocaleDateString()
                        : 'No assessments'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={clients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: '#ffffff',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: '#ffffff'
            },
            '& .MuiSelect-select': {
              color: '#ffffff'
            },
            '& .MuiButtonBase-root': {
              color: '#ffffff',
              '&:hover': {
                background: 'rgba(255,68,68,0.1)'
              }
            }
          }}
        />
      </Paper>
    </Container>
  );
} 