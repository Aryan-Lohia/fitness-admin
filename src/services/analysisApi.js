import api from './api';



export const getAnalysisDates = async (clientId) => {
  try {
    const response = await api.get(`/analysis/clients/${clientId}/dates`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dates');
  }
};
export const getAlertTypes = async (clientId,date) => {
  try {
    const response = await api.get(`/analysis/clients/${clientId}/alerts`, {
      params: {
        date
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch alert types');
  }
};
export const getClientsWithAlerts = async () => {
  try {
    const response = await api.get('/admin/clients-with-alerts');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch clients with alerts');
  }
};
// Get latest client analysis
export const getClientAnalysis = async (clientId,selectedDate) => {
  try {
    const response = await api.get(`/analysis/clients/${clientId}/analysis`, {
      params: {
        selectedDate
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch client analysis');
  }
};


// Get client data history
export const getClientDataHistory = async (clientId, selectedDate) => {
  try {
    
    const response = await api.get(`/analysis/clients/${clientId}/history`, {
      params: {
        selectedDate
      }

    });
    console.log("response",response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch client data history');
  }
};