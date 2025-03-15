import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,


  TableRow,
  Paper,
  TextField,
  Box,
  Typography,
  IconButton,
  Button,
  TableSortLabel,
  TablePagination
} from '@mui/material';
import { format } from 'date-fns';
import { searchClients } from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CreateClient from './CreateClient';

const PersonnelList = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('army_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchClients = async (searchTerm = '') => {
    try {
      const data = await searchClients(searchTerm);
      setClients(data);
      setPage(0);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    fetchClients(value);
  };

  const handleViewClient = (clientId) => {
    navigate(`/admin-panel/personnel/${clientId}`);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchClients(search); // Refresh the list
  };

  // Sort and paginate clients
  const sortedClients = [...clients].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    // Handle date fields differently
    if (['dob', 'last_assessment'].includes(sortBy)) {
      const dateA = new Date(aValue || 0);
      const dateB = new Date(bValue || 0);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Handle string comparison
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    // Numeric comparison
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const paginatedClients = sortedClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
    setPage(0); // Reset to first page when sorting changes
  };

  return (
    <Box sx={{ 
      p: 3,
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3,
        background: 'linear-gradient(145deg, #400000 0%, #000000 100%)',
        p: 2,
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#ffffff',
          textShadow: '0 0 10px rgba(255,68,68,0.5)',
          letterSpacing: '1.5px'
        }}>
          Personnel List
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setShowCreateModal(true)}
          sx={{
            background: 'linear-gradient(45deg, #8b0000 30%, #400000 90%)',
            fontWeight: 'bold',
            letterSpacing: '1px',
            '&:hover': {
              background: 'linear-gradient(45deg, #400000 30%, #8b0000 90%)',
              boxShadow: '0 4px 15px rgba(255,68,68,0.3)'
            }
          }}
        >
          Add New Army Personnel
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Search by Name or Army ID"
        variant="outlined"
        value={search}
        onChange={handleSearchChange}
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            color: '#ffffff',
            fieldset: { borderColor: '#8b0000' },
            '&:hover fieldset': { borderColor: '#ff4444' },
            '&.Mui-focused fieldset': { borderColor: '#ff4444' }
          },
          '& .MuiInputLabel-root': {
            color: '#cccccc'
          }
        }}
      />

      <TableContainer component={Paper} sx={{
        background: 'linear-gradient(145deg, rgba(64,0,0,0.3) 0%, rgba(0,0,0,0.3) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,68,68,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              background: 'linear-gradient(145deg, #400000 0%, #000000 100%)',
            }}>
              {[
                { id: 'army_id', label: 'Army ID' },
                { id: 'name', label: 'Name' },
                { id: 'gender', label: 'Gender' },
                { id: 'dob', label: 'Date of Birth' },
                { id: 'last_assessment', label: 'Last Assessment' },
              ].map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                  sx={{ 
                    cursor: 'pointer',
                    color: '#ffffff',
                    borderBottom: '2px solid rgba(255,68,68,0.2)'
                  }}
                >
                  <TableSortLabel
                    active={sortBy === column.id}
                    direction={sortBy === column.id ? sortDirection : 'asc'}
                    onClick={() => handleSort(column.id)}
                    sx={{ 
                      color: "#ffffff",
                      '&:hover': { color: '#ff4444' },
                      '&.Mui-active': { color: '#ff4444' }
                    }}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell sx={{ borderBottom: '2px solid rgba(255,68,68,0.2)' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClients.map((client) => (
              <TableRow 
                key={client.id}
                onClick={() => handleViewClient(client.id)}
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
                <TableCell>{client.gender}</TableCell>
                <TableCell>
                  {client.dob ? format(new Date(client.dob), 'dd/MM/yyyy') : 'N/A'}
                </TableCell>
                <TableCell>
                  {client.last_assessment 
                    ? format(new Date(client.last_assessment), 'dd/MM/yyyy')
                    : 'No assessments'}
                </TableCell>
                <TableCell></TableCell>
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
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
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

      <Dialog 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, rgba(64,0,0,0.4) 0%, rgba(0,0,0,0.4) 100%)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,68,68,0.2)'
          }
        }}
      >
        
        <DialogContent style={{ padding: 0 }}>
          <CreateClient 
            onSuccess={handleCreateSuccess} 
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PersonnelList; 