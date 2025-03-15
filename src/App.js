import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateClient from './pages/CreateClient';
import ClientData from './pages/ClientData';
import PrivateRoute from './components/PrivateRoute';
import PersonnelList from './pages/PersonnelList';
import ClientAnalysis from './pages/ClientAnalysis';
import Alerts from './pages/Alerts';
function App() {
  
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/admin-panel/" element={<Navigate to="/admin-panel/dashboard" />} />
              <Route path="/admin-panel/dashboard" element={<Dashboard />} />
              {/* <Route path="/admin-panel/create-personnel" element={<CreatePersonnel />} /> */}
              <Route path="/admin-panel/personnel" element={<PersonnelList />} />
              <Route path="/admin-panel/personnel/:clientId" element={<ClientData />} />
              <Route path="/admin-panel/personnel/:clientId/analysis" element={<ClientAnalysis />} />
              <Route path="/admin-panel/alerts" element={<Alerts />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
