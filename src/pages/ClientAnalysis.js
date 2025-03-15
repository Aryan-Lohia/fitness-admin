import { useState, useEffect, useRef } from 'react';
import { 
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Avatar,
  Chip,
  Fade,
  Grow,
  useTheme,
  Tab,
  Tabs
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { getClientAnalysis, getClientDataHistory, getAnalysisDates, getAlertTypes } from '../services/analysisApi';
import { getClientById } from '../services/api';
import { format, subMonths } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import {
  MonitorHeart as HeartIcon,
  Thermostat as TempIcon,
  Opacity as HbIcon,
  LocalHospital as WbcIcon,
  Bloodtype as PlateletIcon,
  Favorite as Spo2Icon,
  Restaurant as GlucoseIcon,
  BatteryAlert as CriticalIcon,
} from '@mui/icons-material';

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
const scaleValue = (value, min, max) => {
  return ((value - min) / (max - min)) * 100;
}

const RiskGauge = ({ 
  value, 
  size = 250, 
  unit = '%',
  textSizeMultiplier = 0.12,
  category = '', 
  color, 
  invertColors = false,
  min = 0,
  max = 100
}) => {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  const getGradientColors = () => {
    if(invertColors){
      return [
        { offset: "0%", color: color },
        { offset: "33%", color: color },
        { offset: "66%", color: color },
        { offset: "100%", color: color }
      ];
    }
    return [
      { offset: "0%", color: color },
      { offset: "33%", color: color },
      { offset: "66%", color: color },
      { offset: "100%", color: color }
    ];
  };

  // Scale the value between 0-100 based on min and max
  const scaledValue = ((value - min) / (max - min)) * 100;

  // Calculate the arc path and length
  const radius = size * 0.4;
  const pathLength = Math.PI * radius;
  const progress = (scaledValue / 100) * pathLength;

  return (
    <Box sx={{ position: 'relative', width: size, height: size/2, margin: 'auto' }}>
      <svg width={size} height={size/2}>
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
            {getGradientColors().map((stop, index) => (
              <stop 
                key={index} 
                offset={stop.offset} 
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
        </defs>
        
        {/* Background Arc */}
        <path
          d={`M ${size * 0.1},${size/2} 
              A ${radius},${radius} 0 0 1 ${size * 0.9},${size/2}`}
          fill="none"
          stroke="#2C2D33"
          strokeWidth={size * 0.15}
          strokeLinecap="round"
        />
        
        {/* Colored Arc - Only shows up to value */}
        <path
          d={`M ${size * 0.1},${size/2} 
              A ${radius},${radius} 0 0 1 ${size * 0.9},${size/2}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={size * 0.15}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${pathLength}`}
          style={{
            transformOrigin: 'center',
            transformBox: 'fill-box'
          }}
        />
        
        {/* Value Text */}
        <text
          x="50%"
          y="95%"
          textAnchor="middle"
          fill={colorPalette.text}
          style={{
            fontSize: size * textSizeMultiplier,
            fontWeight: 'bold'
          }}
        >
          {value.toFixed(1)}
          <tspan 
            dx="2" 
            style={{
              fontSize: size * textSizeMultiplier * 0.5,
              fontWeight: 'normal',
            }}
          >
            {unit}
          </tspan>
        </text>
      </svg>
      
      {/* Add ideal range indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          mt: 2,
          color: colorPalette.textSecondary
        }}
      >
   
        {category && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: colorPalette.textSecondary,
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: size/20,
              display: 'block',
              mt: 1
            }}
          >
            {category}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Update HealthCard styled component
const HealthCard = styled(Paper)(({ theme }) => ({
  padding: 24,
  background: colorPalette.cardBg,
  borderRadius: 12,
  height: '100%',
  boxShadow: 'none',
  border: '1px solid rgba(255, 27, 27, 0.2)',
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
    padding: 1,
    background: 'linear-gradient(45deg, #FF1B1B 0%, transparent 50%)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
  }
}));

// Update MetricBox styled component
const MetricBox = styled(Box)(({ theme }) => ({
  padding: 16,
  borderRadius: 8,
  background: 'linear-gradient(to right, rgba(255, 27, 27, 0.1) 0%, rgba(0,0,0,0.3) 100%)',
  marginTop: 16,
  border: '1px solid rgba(255, 27, 27, 0.15)',
  position: 'relative',
  '&:hover': {
    borderColor: 'rgba(255, 27, 27, 0.4)'
  }
}));

const CardiovascularHealthCard = ({ metrics }) => {
  return (
    <HealthCard>
      <Typography variant="h6" gutterBottom sx={{ color: colorPalette.text }}>
        Cardiovascular Health
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 4 }}>
        {/* Heart Health Section */}
        <Box sx={{ flex: '1 1 300px' }}>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <RiskGauge 
                value={scaleValue(metrics.chd_risk, metrics.chd_risk_min, metrics.chd_risk_max)} 
                category={metrics.chd_risk_category}
                color={colorPalette.purple}
                min={0}
                max={100}
              />
              <Typography variant="subtitle2" align="center" sx={{ mt: 1, color: colorPalette.textSecondary }}>
                CHD Risk
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stroke Risk Section */}
        <Box sx={{ flex: '1 1 300px' }}>
       
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <RiskGauge 
                value={scaleValue(metrics.adjusted_stroke_risk, metrics.total_stroke_points_risk_min, metrics.total_stroke_points_risk_max)}
                category={metrics.stroke_risk_category}
                color={colorPalette.red}
                min={0}
                max={100}
              />
              <Typography variant="subtitle2" align="center" sx={{ mt: 1, color: colorPalette.textSecondary }}>
                Stroke Risk
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ASCVD Risk Section */}
        <Box sx={{ flex: '1 1 300px' }}>
       
       
            <Box sx={{ flex: 1 }}>
              <RiskGauge 
                value={metrics.enhanced_ascvd_risk *100}
                category={metrics.ascvd_category}
                color={colorPalette.blue}
                min={0}
                max={100}
              />
              <Typography variant="subtitle2" align="center" sx={{ mt: 1, color: colorPalette.textSecondary }}>
                ASCVD Risk
              </Typography>
            </Box>
        </Box>
      </Box>

      {/* Recommendations Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ color: colorPalette.text, fontWeight: 600 }}>
          Recommendations
        </Typography>
        {metrics.heart_health_recommendations.map((rec, index) => (
          <MetricBox key={index}>
            <Typography variant="body2" sx={{ color: colorPalette.text }}>{rec}</Typography>
          </MetricBox>
        ))}
      </Box>
    </HealthCard>
  );
};

const DiabetesHealthCard = ({ metrics }) => {
  return (
    <HealthCard>
      <Typography variant="h6" gutterBottom sx={{ color: colorPalette.text }}>
        Diabetes Risk
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: 4 }}>
        <Box sx={{ flex: 1 }}>
          <RiskGauge 
            value={scaleValue(metrics.total_diabetes_points, metrics.diabetes_risk_min, metrics.diabetes_risk_max)}
            category={metrics.base_diabetes_risk}
            color={colorPalette.orange}
            min={0}
            max={100}
          />
          <Typography variant="subtitle2" align="center" sx={{ mt: 1, color: colorPalette.textSecondary }}>
            Total Points: {metrics.total_diabetes_points}
          </Typography>
        </Box>
      </Box>

      <Box sx={{  }}>
        {metrics.diet_suggestions.map((suggestion, index) => (
          <MetricBox key={index}>
            <Typography variant="body2" sx={{ color: colorPalette.text }}>
              {suggestion}
            </Typography>
          </MetricBox>
        ))}
      </Box>
    </HealthCard>
  );
};

const KidneyHealthCard = ({ metrics }) => {
  const getRiskColor = () => {
    const group = metrics.ckd_risk_group;
    if (group >= 4) return colorPalette.red;
    if (group >= 2) return colorPalette.orange;
    return colorPalette.green;
  };

  return (
    <HealthCard>
      <Typography variant="h6" gutterBottom sx={{ color: colorPalette.text }}>
        Kidney Health
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: 4 }}>
        <Box sx={{ flex: 1 }}>
          <RiskGauge 
            value={scaleValue(metrics.ckd_risk_score, metrics.ckd_risk_min, metrics.ckd_risk_max)}
            category={metrics.ckd_kidney_risk_category}
            color={getRiskColor()}
            min={0}
            max={100}
          />
          <Typography variant="subtitle2" align="center" sx={{ mt: 1, color: colorPalette.textSecondary }}>
            Risk Group: {metrics.ckd_risk_group}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 5 }}>
        {metrics.kidney_health_recommendations.map((rec, index) => (
          <MetricBox key={index}>
            <Typography variant="body2" sx={{ color: colorPalette.text }}>{rec}</Typography>
          </MetricBox>
        ))}
      </Box>
    </HealthCard>
  );
};

const MonitoringCard = ({ metrics }) => {
  return (
    <HealthCard>
      <Typography variant="h6" gutterBottom sx={{ color: colorPalette.text }}>
        Monitoring & Follow-up
      </Typography>
      
      <Box>
        {metrics.monitoring_recommendations.map((rec, index) => (
          <MetricBox 
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ 
              width: 40, 
              height: 25, 
              borderRadius: '50%', 
              backgroundColor: colorPalette.purple,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorPalette.text,
              fontWeight: 'bold'
            }}>
              {index + 1}
            </Box>
            <Typography variant="body2" sx={{ color: colorPalette.text }}>
              {rec}
            </Typography>
          </MetricBox>
        ))}
      </Box>
    </HealthCard>
  );
};

const LongTermGoalsCard = ({ goals }) => {
  return (
    <HealthCard>
      <Typography variant="h6" gutterBottom sx={{ color: colorPalette.text }}>
        Long Term Goals
      </Typography>
      
      <Box>
        {goals.map((goal, index) => (
          <MetricBox 
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ 
              width: 40, 
              height: 25, 
              borderRadius: '50%', 
              backgroundColor: colorPalette.green,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorPalette.text,
              fontWeight: 'bold'
            }}>
              {index + 1}
            </Box>
            <Typography variant="body2" sx={{ color: colorPalette.text }}>
              {goal}
            </Typography>
          </MetricBox>
        ))}
      </Box>
    </HealthCard>
  );
};

const LiverHealthCard = ({ recommendations }) => {
  return (
    <HealthCard>
      <Typography variant="h6" gutterBottom sx={{ color: colorPalette.text }}>
        Liver Health
      </Typography>
      
      {recommendations.length > 0 ? (
        <Box>
          {recommendations.map((rec, index) => (
            <MetricBox key={index}>
              <Typography variant="body2" sx={{ color: colorPalette.text }}>{rec}</Typography>
            </MetricBox>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: colorPalette.textSecondary, mt: 2 }}>
          No liver health concerns detected
        </Typography>
      )}
    </HealthCard>
  );
};

const MedicationCard = ({ recommendations }) => {
  return (
    <HealthCard>
      <Typography variant="h6" gutterBottom sx={{ color: colorPalette.text }}>
        Medication Recommendations
      </Typography>
      
      {recommendations.length > 0 ? (
        <Box>
          {recommendations.map((med, index) => (
            <MetricBox 
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ 
                width: 40, 
                height: 25, 
                borderRadius: '50%', 
                backgroundColor: colorPalette.blue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorPalette.text,
                fontWeight: 'bold'
              }}>
                Rx
              </Box>
              <Typography variant="body2" sx={{ color: colorPalette.text }}>
                {med}
              </Typography>
            </MetricBox>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: colorPalette.textSecondary, mt: 2 }}>
          No medication changes recommended at this time
        </Typography>
      )}
    </HealthCard>
  );
};

const TrendAnalysisCard = ({ trends }) => {
  return (
    <HealthCard>
      <Typography variant="h6" gutterBottom sx={{ color: colorPalette.text }}>
        Trend Analysis
      </Typography>
      
      <Box>
        {trends.map((trend, index) => (
          <MetricBox 
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            {trend.direction === 'up' ? (
              <TrendingUpIcon sx={{ color: colorPalette.green }} />
            ) : (
              <TrendingDownIcon sx={{ color: colorPalette.red }} />
            )}
            <Typography variant="body2" sx={{ color: colorPalette.text }}>
              {trend}
            </Typography>
          </MetricBox>
        ))}
      </Box>
    </HealthCard>
  );
};
const MetricsGaugesGrid = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const latestData = data[data.length - 1] || {};
  
  const metricCategories = {
    'Vital Signs': [
      { name: 'Systolic BP', value: latestData.sbp, color: colorPalette.blue, unit: 'mmHg', min: 90, max: 180 },
      { name: 'Diastolic BP', value: latestData.dbp, color: colorPalette.purple, unit: 'mmHg', min: 60, max: 120 },
      { name: 'Heart Rate', value: latestData.heart_rate, color: colorPalette.red, unit: 'bpm', min: 60, max: 100 },
      { name: 'Temperature', value: latestData.temp_f, color: colorPalette.red, unit: '°F', min: 95, max: 105 },
      { name: 'SPO2', value: latestData.spo2, color: colorPalette.green, unit: '%', min: 50, max: 100 },
    ],
    'Body Measurements': [
      { name: 'Weight', value: latestData.wt_kg, color: colorPalette.green, unit: 'kg', min: 40, max: 120 },
      { name: 'Height', value: latestData.ht_cm, color: colorPalette.orange, unit: 'cm', min: 150, max: 200 },
      { name: 'Waist', value: latestData.waist_circumference, color: colorPalette.pink, unit: 'cm', min: 60, max: 120 },
    ],
    'Blood Sugar': [
      { name: 'Fasting Blood Sugar', value: latestData.fbs, color: colorPalette.orange, unit: 'mg/dL', min: 70, max: 200 },
      { name: 'Post Prandial BS', value: latestData.ppbs, color: colorPalette.yellow, unit: 'mg/dL', min: 70, max: 200 },
      { name: 'HbA1c', value: latestData.hba1c, color: colorPalette.red, unit: '%', min: 4, max: 14 },
    ],
    'Lipid Profile': [
      { name: 'Serum Bilirubin', value: latestData.t_bilirubin, color: colorPalette.yellow, unit: 'mg/dL', min: 100, max: 300 },
      { name: 'Total Cholesterol', value: latestData.t_choles, color: colorPalette.yellow, unit: 'mg/dL', min: 100, max: 300 },
      { name: 'HDL', value: latestData.hdl, color: colorPalette.green, unit: 'mg/dL', min: 20, max: 100 },
      { name: 'LDL', value: latestData.ldl, color: colorPalette.red, unit: 'mg/dL', min: 50, max: 200 },
    ],
    'Kidney Function': [
      { name: 'Total Protein', value: latestData.t_protein, color: colorPalette.green, unit: 'mg/dL', min: 6, max: 8 },
      { name: 'Creatinine', value: latestData.sr_creatinine, color: colorPalette.pink, unit: 'mg/dL', min: 0, max: 2 },
      { name: 'Globulin', value: latestData.sr_globulin, color: colorPalette.purple, unit: 'mg/dL', min: 0, max: 2 },
      { name: 'Albumin', value: latestData.sr_albumin, color: colorPalette.blue, unit: 'mg/dL', min: 0, max: 2 },
    ],
    'Blood Composition': [
      { name: 'Hemoglobin', value: latestData.hb, color: colorPalette.red, unit: 'g/dL', min: 8, max: 18 },
      { name: 'WBC Count', value: latestData.wbc, color: colorPalette.blue, unit: '×10³/µL', min: 4, max: 11 },
      { name: 'Platelet Count', value: latestData.plt, color: colorPalette.purple, unit: '×10³/µL', min: 150, max: 450 },
    ],
  };
  const categories = Object.entries(metricCategories);
  const carouselRef = useRef(null);

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % categories.length);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + categories.length) % categories.length);
  };

  return (
    <Box sx={{ position: 'relative', px: 4 }}>
      {/* Navigation Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: 2,
        mb: 2,
        mt:2,
        position: 'sticky',
        top: 0,
        zIndex: 1,
        pb: 2
      }}>
        <IconButton 
          onClick={handlePrev}
          sx={{ 
            bgcolor: 'rgba(255,27,27,0.2)', 
            '&:hover': { bgcolor: 'rgba(255,27,27,0.4)' }
          }}
        >
          <ChevronLeft sx={{ color: colorPalette.text }} />
        </IconButton>
        <IconButton 
          onClick={handleNext}
          sx={{ 
            bgcolor: 'rgba(255,27,27,0.2)', 
            '&:hover': { bgcolor: 'rgba(255,27,27,0.4)' }
          }}
        >
          <ChevronRight sx={{ color: colorPalette.text }} />
        </IconButton>
      </Box>

      {/* Carousel Container */}
      <Box 
        ref={carouselRef}
        sx={{ 
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: '100%',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {categories.map(([category, metrics], index) => (
          <Box 
            key={category} 
            sx={{ 
              gridColumn: 1,
              gridRow: 1,
              opacity: index === activeIndex ? 1 : 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: index === activeIndex ? 'auto' : 'none'
            }}
          >
            <Paper 
              sx={{ 
                p: 3, 
                mb: 2,
                background: 'linear-gradient(to bottom, #0a0a0a 0%, #000 100%)',
                borderRadius: 2,
                border: '1px solid rgba(255, 27, 27, 0.2)',
                boxShadow: '0 4px 20px rgba(255, 27, 27, 0.05)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: colorPalette.text,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  pb: 1
                }}
              >
                {category}
              </Typography>
              <Grid container spacing={3}>
              {metrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      mb: 2, 
                      background: 'linear-gradient(to bottom, #0a0a0a 0%, #000 100%)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 27, 27, 0.2)',
                      boxShadow: '0 4px 20px rgba(255, 27, 27, 0.05)'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 1,
             
                    }}>
                      {/* Metric Header */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        mb: 2,
                        width: '100%',
                        borderRadius: 2,
                        bgcolor: colorPalette.background,
                        border: `1px solid ${metric.color}`
                      }}>
                        <Box sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          bgcolor: metric.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colorPalette.text,
                          fontWeight: 'bold'
                        }}>
                          {metric.name[0]}
                        </Box>
                        <Typography variant="body2" sx={{ color: colorPalette.text }}>
                          {metric.name}
                        </Typography>
                      </Box>

                      {/* Gauge with smaller text */}
                      <RiskGauge
                        value={metric.value || 0}
                        color={metric.color}
                        unit={metric.unit}
                        min={metric.min}
                        max={metric.max}
                        textSizeMultiplier={0.09} // Reduced from 0.12
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const HistoricalDataCharts = ({ data }) => {
  const theme = useTheme();
  
  const renderChart = (chartComponent, title) => (
    <Grow in timeout={500}>
      <Paper sx={{ p: 3, height: '100%',
        background: 'linear-gradient(to bottom, #0a0a0a 0%, #000 100%)',
        borderRadius: 2,
        border: '1px solid rgba(255, 27, 27, 0.4)',
        boxShadow: '0 4px 20px rgba(255, 27, 27, 0.05)'
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          {chartComponent}
        </ResponsiveContainer>
      </Paper>
    </Grow>
  );

  // Update the Line components to have thicker lines, for example:
  const lineProps = {
    strokeWidth: 3.5,
    dot: false,
    activeDot: { 
      strokeWidth: 2, 
      r: 6,
      fill: '#fff',
      stroke: 'currentColor'
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Vital Signs */}
      <Grid item xs={12} md={6}>
        {renderChart(
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sbp" name="Systolic BP" stroke={theme.palette.primary.main} {...lineProps} />
            <Line type="monotone" dataKey="dbp" name="Diastolic BP" stroke={theme.palette.secondary.main} {...lineProps} />
            <Line type="monotone" dataKey="heart_rate" name="Heart Rate" stroke={colorPalette.red} {...lineProps} />
          </LineChart>,
          'Vital Signs'
        )}
      </Grid>
      
      {/* Body Measurements */}
      <Grid item xs={12} md={6}>
        {renderChart(
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="wt_kg" name="Weight (kg)" stroke={colorPalette.blue} {...lineProps} />
            <Line yAxisId="left" type="monotone" dataKey="ht_cm" name="Height (cm)" stroke={colorPalette.green} {...lineProps} />
            <Line yAxisId="right" type="monotone" dataKey="waist_circumference" name="Waist (cm)" stroke={colorPalette.orange} {...lineProps} />
          </LineChart>,
          'Body Measurements'
        )}
      </Grid>

      {/* Blood Sugar */}
      <Grid item xs={12} md={6}>
        {renderChart(
          <LineChart data={data}>
              <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="fbs" name="Fasting Blood Sugar" stroke={colorPalette.purple} {...lineProps} />
            <Line type="monotone" dataKey="ppbs" name="Post Prandial BS" stroke={colorPalette.pink} {...lineProps} />
            <Line type="monotone" dataKey="hba1c" name="HbA1c" stroke={colorPalette.red} {...lineProps} />
          </LineChart>,
          'Blood Sugar Metrics'
        )}
      </Grid>

      {/* Lipid Profile */}
      <Grid item xs={12} md={6}>
        {renderChart(
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="t_choles" name="Total Cholesterol" stroke={colorPalette.yellow} {...lineProps} />
            <Line type="monotone" dataKey="ldl" name="LDL" stroke={colorPalette.red} {...lineProps} />
            <Line type="monotone" dataKey="hdl" name="HDL" stroke={colorPalette.green} {...lineProps} />
          </LineChart>,
          'Lipid Profile'
        )}
      </Grid>


      {/*Kidney & Liver Function */}
      <Grid item xs={12} md={6}>
        {renderChart(
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sr_creatinine" name="Creatinine" stroke={colorPalette.orange} {...lineProps} />

            <Line type="monotone" dataKey="sr_albumin" name="Albumin" stroke={colorPalette.blue} {...lineProps} />
            <Line type="monotone" dataKey="sr_globulin" name="Globulin" stroke={colorPalette.purple} {...lineProps} />
            <Line type="monotone" dataKey="t_protein" name="Total Protein" stroke={colorPalette.green} {...lineProps} />
          </LineChart>,
          'Kidney Function'
        )}
      </Grid>
      {/* Liver Function */}
      <Grid item xs={12} md={6}>
        {renderChart(
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="t_bilirubin" name="Total Bilirubin" stroke={colorPalette.yellow} {...lineProps} />
            <Line type="monotone" dataKey="t_choles" name="Total Cholesterol" stroke={colorPalette.green} {...lineProps} />
            <Line type="monotone" dataKey="hdl" name="HDL" stroke={colorPalette.blue} {...lineProps} />
            <Line type="monotone" dataKey="ldl" name="LDL" stroke={colorPalette.purple} {...lineProps} />
          </LineChart>,
          'Liver Function'
        )}
      </Grid>

      {/* Complete Blood Count */}
      <Grid item xs={12} md={6}>
        {renderChart(
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="hb" name="Hemoglobin" stroke={colorPalette.red} {...lineProps} />
            <Line type="monotone" dataKey="wbc" name="WBC Count" stroke={colorPalette.blue} {...lineProps} />
            <Line type="monotone" dataKey="plt" name="Platelet Count" stroke={colorPalette.purple} {...lineProps} />
          </LineChart>,
          'Complete Blood Count'
        )}
      </Grid>

      {/* Lifestyle Factors */}
      {/* <Grid item xs={12} md={6}>
        {renderChart(
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              domain={[0, 2]}
              tickFormatter={(value) => {
                switch(value) {
                  case 0: return 'None';
                  case 1: return 'Moderate';
                  case 2: return 'High';
                  default: return value;
                }
              }}
            />
            <Tooltip 
              formatter={(value, name) => {
                const formattedValue = 
                  name === 'Physical Activity' ? ['Low', 'Moderate', 'High'][value] :
                  ['None', 'Occasional', 'Regular'][value];
                return [formattedValue, name];
              }}
            />
            <Legend />
            <Bar 
              dataKey="alcohol_intake" 
              name="Alcohol Intake" 
              fill={colorPalette.red} 
              {...lineProps} 
            />
            <Bar 
              dataKey="smoking" 
              name="Smoking Status" 
              fill={colorPalette.purple} 
              {...lineProps} 
            />
            <Bar 
              dataKey="phy_activity" 
              name="Physical Activity" 
              fill={colorPalette.green} 
              {...lineProps} 
            />
          </BarChart>,
          'Lifestyle Factors'
        )}
      </Grid> */}
    </Grid>
  );
};

const threshold = {
  'heart_rate': {value:100, sign:'>'},
  'sbp': {value:140, sign:'>'},
  'dbp': {value:100, sign:'>'},
  'spo2': {value:90, sign:'<'},
  'temp_f': {value:100, sign:'>'},
  'hb': {value:10, sign:'<'},
  'wbc': {value:11, sign:'>'},
  'plt': {value:1, sign:'<'},
  'fbs': {value:100, sign:'>'},
  'ppbs': {value:140, sign:'>'},
  'hba1c': {value:6.20, sign:'>'},
  't_choles': {value:200, sign:'>'},
  'hdl': {value:40, sign:'<'},
  'ldl': {value:100, sign:'>'},
  't_bilirubin': {value:1.2, sign:'>'},
  'sr_creatinine': {value:1.4, sign:'>'},
  't_protein': {value:6.0, sign:'<'},
  'sr_albumin': {value:3.5, sign:'<'},
  'sr_globulin': {value:2.0, sign:'<'}
};



const ClientAnalysis = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clientDetails, setClientDetails] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [recordDates, setRecordDates] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [alertsData, setAlertsData] = useState({});
  const [alertTypes, setAlertTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dates = await getAnalysisDates(clientId);
        setRecordDates(dates);
        setSelectedDate(dates[dates.length - 1].analyzed_at);
        const [details, analysis, history, alerts] = await Promise.all([
          getClientById(clientId),
          getClientAnalysis(clientId, selectedDate),
          getClientDataHistory(clientId, selectedDate),
          getAlertTypes(clientId, dates[dates.length - 1].analyzed_at)
        ]);
        
        if (!details || !analysis || !history || !dates || !alerts) {
          throw new Error('Missing required client data');
        }
        
        setClientDetails(details);
        setAnalysisResult(analysis);
        setHistoricalData(processChartData(history));
        setAlertsData(processAlerts(alerts));
        setAlertTypes(alertTypes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setClientDetails(null);
        setAnalysisResult(null);
        setLoading(false);
      }
    };

    if (selectedDate) fetchData();
  }, [selectedDate, clientId]);

  const processChartData = (data) => {
    const dateMap = {};
    
    // Transform the data structure to group by date
    Object.entries(data).forEach(([metric, values]) => {
      values.forEach(({ value, recorded_at }) => {
        const dateKey = format(new Date(recorded_at), 'MMM dd');
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { date: dateKey };
        }
        
        // Convert categorical data to numerical values for visualization
        if (metric === 'smoking') {
          dateMap[dateKey][metric] = value === 'occasionally' ? 1 : value === 'regularly' ? 2 : 0;
        } else if (metric === 'alcohol_intake') {
          dateMap[dateKey][metric] = value === 'Weekly' ? 1 : value === 'Daily' ? 2 : 0;
        } else if (metric === 'phy_activity') {
          dateMap[dateKey][metric] = value === 'moderately active' ? 1 : value === 'very active' ? 2 : 0;
        } else {
          dateMap[dateKey][metric] = value;
        }
      });
    });

    return Object.values(dateMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  };

  const processAlerts = (alerts) => {
    // Implement the logic to process alerts data
    // This is a placeholder and should be replaced with the actual implementation
    return alerts;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#ff4444' }} /> 
      </Box>
    );
  }

  if (!clientDetails || !analysisResult) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>
        <Typography variant="h6">
          Failed to load client data. Please try refreshing the page.
        </Typography>
      </Box>
    );
  }
  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 4, 
        backgroundColor: '#000000',
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(to bottom right, rgba(255,27,27,0.05) 0%, transparent 50%)'
   
      }}
    >
      {/* Header Section */}
      <Fade in={!loading} timeout={500}>
        <Paper sx={{ p: 3, mb: 4, 
          background: 'linear-gradient(to bottom, #0a0a0a 0%, #000 100%)',
          borderRadius: 2,
          border: '1px solid rgba(255, 27, 27, 0.2)',
          boxShadow: '0 4px 20px rgba(255, 27, 27, 0.05)'
         }}>
          <Box sx={{ 
            position: 'relative',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%',
            p: 3
          }}>
            <Box sx={{ 
              position: 'absolute',
              top: 5,
              left: 5,
              display: 'flex',
              alignItems: 'center'
            }}>
              <IconButton 
                onClick={() => navigate(-1)}
                sx={{ 
                  mr: 2,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': {  
                    backgroundColor: 'rgba(255,1,1,0.7)' ,
                    color:'#ffffff'
                  }
                }}
              >
                <ChevronLeft sx={{ color: '#000',
                  '&:hover': {
                    color: '#ffffff'
                  }
                 }} />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'rgba(255,68,68,0.1)',
                    border: '2px solid rgba(255,68,68,0.3)',
                    boxShadow: '0 0 15px rgba(255,68,68,0.2)',
                    color: '#ff4444',
                    textShadow: '0 0 10px rgba(255,68,68,0.8)'
                  }}
              /  >
                              <Box>
                <Typography variant="h6" color="text.secondary">
                  {clientDetails?.army_id || 'Unknown Client'}
                </Typography>
                <Typography variant="h4" color="text.primary">
                  {clientDetails?.name || 'Unknown Client'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {clientDetails?.dob ? `${calculateAge(clientDetails.dob)} years` : ''} • 
                  {clientDetails?.gender.charAt(0).toUpperCase() + clientDetails?.gender.slice(1)}
                 
                </Typography>
                <Box component="span" sx={{display: 'inline-flex', gap: 1.5,mt:1 }}>
                    {['alcohol_intake', 'smoking', 'phy_activity'].map((factor) => (
                      <Chip
                        key={factor}
                        label={`${factor.replace('_', ' ')}: ${historicalData[historicalData.length - 1][factor] === 2 ? 'None' : historicalData[historicalData.length - 1][factor] === 1? 'Moderate' : 'High'}`}
                        sx={{
                          backgroundColor: 'rgba(255,68,68,0.15)',
                          color: colorPalette.text,
                          textTransform: 'capitalize',
                          border: '1px solid rgba(255,68,68,0.3)'
                        }}
                      />
                    ))}
                  </Box>
              </Box>
            </Box>

            {/* Overall Risk Gauge */}
            <Box sx={{ textAlign: 'center' }}>
              <RiskGauge 
                invertColors
                color={colorPalette.green}
                value={scaleValue(100-analysisResult?.overall_risk_percentage, analysisResult?.overall_risk_min, analysisResult?.overall_risk_max)}
                category={analysisResult?.overall_risk_category==='Low' ? 'Good' : analysisResult?.overall_risk_category==="Moderate" ? 'Average' : 'High Risk'}
                idealMin={scaleValue(0, analysisResult?.overall_risk_min, analysisResult?.overall_risk_max)}
                idealMax={scaleValue(20, analysisResult?.overall_risk_min, analysisResult?.overall_risk_max)}
                min={0}
                max={100}
              />
              <Typography variant="subtitle2" align="center" sx={{ mt: 1, color: colorPalette.textSecondary }}>
                Health Score
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <RiskGauge 
                value={scaleValue(analysisResult?.overall_risk_percentage, analysisResult?.overall_risk_min, analysisResult?.overall_risk_max)}
                category={analysisResult?.overall_risk_category}
                color={colorPalette.red}
                min={0}
                max={100}
              />
              <Typography variant="subtitle2" align="center" sx={{ mt: 1, color: colorPalette.textSecondary }}>
                Overall Risk
              </Typography>
            </Box>
          </Box>
            {/* Tabs Section */}
      <Paper sx={{ mb: 4, 
        background: 'linear-gradient(to bottom, #0a0a0a 0%, #000 100%)',
        borderRadius: 2,
        border: '1px solid rgba(255, 27, 27, 0.2)',
        boxShadow: '0 4px 20px rgba(255, 27, 27, 0.05)'
       }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="white"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Summary" />
          <Tab label="Current Metrics" />
          <Tab label="Historical Data" />
          <Tab label="Analysis Results" />
          <Tab label="Insights" />
        </Tabs>
{activeTab === 0 && (
  <Grid container spacing={3} sx={{
    p:3
  }}>
    {/* Health Summary */}
    <Grid item xs={24} md={12}>
      <Paper sx={{
        p: 3,
        height: '100%',
        background: 'linear-gradient(145deg, rgba(255,27,27,0.1) 0%, #0a0a0a 100%)',
        border: '1px solid rgba(255,27,27,0.3)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(255,27,27,0.1)'
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: colorPalette.text }}>
          Health Summary
        </Typography>
        <Box component="ul" sx={{ pl: 2.5, color: colorPalette.textSecondary }}>
          {analysisResult.summary.split('.').slice(0, -1).map((line, i) => (
            <Typography component="li" key={i} variant="body2" sx={{ mb: 1.5 }}>
              {line}
            </Typography>
          ))}
        </Box>
      </Paper>
    </Grid>
   {/* Alerts */}
   <Grid item xs={12}>
      <Paper sx={{
        p: 2,
        background: 'linear-gradient(145deg, rgba(16,16,16,0.8) 0%, rgba(32,32,32,0.6) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Typography variant="h6" sx={{ 
          color: '#fff', 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <WarningIcon fontSize="small" />
          Critical Alerts
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(alertsData).map(([metric, value]) => {
            const alertConfig = alertTypes.find(a => a.category === metric) || {};
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={metric}>
                <Paper sx={{
                  p: 2,
                  borderLeft: `4px solid ${alertConfig.color || '#ff4444'}`,
                  background: 'linear-gradient(145deg, rgba(64,64,64,0.3) 0%, rgba(32,32,32,0.3) 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `${alertConfig.color}10`,
                    zIndex: 0
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
                    <IconButton sx={{ 
                      color: alertConfig.color,
                      background: `${alertConfig.color}20`,
                      '&:hover': { background: `${alertConfig.color}30` }
                    }}>
                      {alertConfig.icon || <WarningIcon />}
                    </IconButton>
                    
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffffcc' }}>
                        {alertConfig.title || metric}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#fff' }}>
                        {Number(value).toFixed(2)} {alertConfig.unit}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#ffffff99' }}>
                        Threshold: {threshold[metric]?.sign} {threshold[metric]?.value}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
          
          {Object.keys(alertsData).length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ 
                color: '#ffffff66',
                textAlign: 'center',
                py: 3
              }}>
                No critical alerts detected
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Grid>
    {/* Immediate Actions */}
    <Grid item xs={12} md={6}>
      <Paper sx={{
        p: 3,
        mt:1,
        height: '100%',
        background: 'rgba(255,27,27,0.15)',
        border: '2px solid rgba(255,27,27,0.4)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(255,27,27,0.2)'
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: colorPalette.red }}>
          ⚠️ Immediate Actions
        </Typography>
        <Box component="ul" sx={{ pl: 2.5 }}>
          {analysisResult.immediate_actions.map((action, i) => (
            <Typography component="li" key={i} variant="body2" sx={{ color: '#ff9d9d', mb: 1.5 }}>
              {action}
            </Typography>
          ))}
        </Box>
      </Paper>
    </Grid>

  
    {/* Trend Analysis */}
    <Grid item xs={12} md={6}>
      <TrendAnalysisCard 
        trends={analysisResult.trend_analysis}
        sx={{
          border: '1px solid rgba(255,27,27,0.3)',
          background: 'linear-gradient(145deg, rgba(255,27,27,0.05) 0%, #0a0a0a 100%)'
        }}
      />
    </Grid>

 
  </Grid>
)}
  {activeTab === 1 && (
        <MetricsGaugesGrid data={historicalData} />
      )}

      {activeTab === 2 && ( 
        <Box sx={{ p: 3,
         
        }}>
        <HistoricalDataCharts data={historicalData} />
        </Box>
      )}

       {activeTab === 3 && (
          <Box sx={{ p: 3,
            background: 'linear-gradient(to bottom, #0a0a0a 0%, #000 100%)',
            borderRadius: 2,
            border: '1px solid rgba(255, 27, 27, 0.2)',
            boxShadow: '0 4px 20px rgba(255, 27, 27, 0.05)' 
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <CardiovascularHealthCard 
                  metrics={{
                    chd_risk: analysisResult.chd_risk,
                    chd_risk_min: analysisResult.chd_risk_min,
                    chd_risk_max: analysisResult.chd_risk_max,
                    chd_risk_category: analysisResult.chd_risk_category,
                    total_stroke_points: analysisResult.total_stroke_points,
                    adjusted_stroke_risk: analysisResult.adjusted_stroke_risk,
                    total_stroke_points_risk_min: analysisResult.total_stroke_points_risk_min,
                    total_stroke_points_risk_max: analysisResult.total_stroke_points_risk_max,
                    stroke_risk_category: analysisResult.stroke_risk_category,
                    ascvd_risk_min: analysisResult.ascvd_risk_min,
                    ascvd_risk_max: analysisResult.ascvd_risk_max,
                    enhanced_ascvd_risk: analysisResult.base_ascvd_risk,
                    ascvd_category: analysisResult.ascvd_category,
                    heart_health_recommendations: analysisResult.heart_health_recommendations
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DiabetesHealthCard 
                  metrics={{
                    total_diabetes_points: analysisResult.total_diabetes_points,
                    base_diabetes_risk: analysisResult.base_diabetes_risk,
                    base_diabetes_risk_type: analysisResult.base_diabetes_risk_type,
                    diet_suggestions: analysisResult.diet_suggestions,
                    diabetes_risk_min: analysisResult.total_diabetes_min,
                    diabetes_risk_max: analysisResult.total_diabetes_max,
                    diabetes_risk_category: analysisResult.diabetes_risk_category
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <KidneyHealthCard 
                  metrics={{
                    ckd_risk_points: analysisResult.ckd_risk_points,
                    ckd_risk_score: analysisResult.ckd_egfr_risk_points                    ,
                    ckd_risk_group: analysisResult.ckd_risk_group,
                    ckd_kidney_risk_category: analysisResult.ckd_kidney_risk_category,
                    kidney_health_recommendations: analysisResult.kidney_health_recommendations,
                    ckd_risk_min: analysisResult.ckd_kidney_min,
                    ckd_risk_max: analysisResult.ckd_kidney_max,
                    ckd_kidney_ideal_range_min: analysisResult.ckd_kidney_ideal_range_min,
                    ckd_kidney_ideal_range_max: analysisResult.ckd_kidney_ideal_range_max

                  }}
                />
              </Grid>
         
              <Grid item xs={12} md={6}>
                <LiverHealthCard 
                  recommendations={analysisResult.liver_health_recommendations}
                />
              </Grid>
           
              
            </Grid>
          </Box>
        )}


      {activeTab === 4 && (
        <Grid container spacing={4} sx={{
          p:3
        }}>
          <Grid item xs={12} md={6}>
            <MonitoringCard metrics={analysisResult} />
          </Grid>
          <Grid item xs={12} md={6}>
            <MedicationCard recommendations={analysisResult.medication_recommendations} />
          </Grid>
          <Grid item xs={12} md={6}>
            <LongTermGoalsCard goals={analysisResult.long_term_goals} />
          </Grid>
            {/* Key Insights */}
    <Grid item xs={12} md={6}>
      <Paper sx={{
        p: 3,
        mt:1,
        height: '100%',
        background: 'linear-gradient(145deg, rgba(25,118,210,0.1) 0%, #0a0a0a 100%)',
        border: '1px solid rgba(25,118,210,0.3)',
        borderRadius: 2
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#4dabf7' }}>
          💡 Key Insights
        </Typography>
        <Box component="ul" sx={{ pl: 2.5, color: '#a6d5ff' }}>
          {analysisResult.primary_risk_factors.map((insight, i) => (
            <Typography component="li" key={i} variant="body2" sx={{ mb: 1.5 }}>
              {insight}
            </Typography>
          ))}
        </Box>
      </Paper>
    </Grid>

  
        </Grid>
      )}
      </Paper>
        </Paper>
      </Fade>

    

     
    </Container>
  );
};

export default ClientAnalysis;