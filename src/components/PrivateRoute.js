import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useEffect ,useState} from 'react';
const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated,setIsAuthenticated] = useState([]);
  const token= localStorage.getItem('token'); // You might want to use a more secure auth check
  useEffect(() => {
    const verifyToken = async () => { 
      const response = await api.post('/auth/admin/verify-token', {token});
      if(response.status === 200){
        setIsAuthenticated(true);
      }
      else{
        setIsAuthenticated(false);
      }
    }
    if (!token) {
      navigate('/');
    }
    else{
      verifyToken();
    }
  }, [token]);
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute; 