import { createTheme } from '@mui/material';

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2D2D2D',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Montserrat, sans-serif',
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#556B2F',
            },
            '&:hover fieldset': {
              borderColor: '#6B8E23',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#556B2F',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2D2D2D',
          borderRight: '1px solid rgba(85, 107, 47, 0.12)',
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#556B2F',
      light: '#6B8E23',
      dark: '#3B4A1F',
    },
    secondary: {
      main: '#6B8E23',
      light: '#85AE2D',
      dark: '#4A6218',
    },
    background: {
      default: '#1E1E1E',
      paper: '#2D2D2D',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
});

export default theme; 